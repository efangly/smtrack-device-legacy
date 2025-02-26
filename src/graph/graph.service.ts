import { Injectable, BadRequestException } from '@nestjs/common';
import { InfluxdbService } from '../influxdb/influxdb.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GraphService {
  constructor(private readonly influxdb: InfluxdbService, private readonly redis: RedisService) {}
  async findAll(sn: string, filter: string) {
    if (!sn) throw new BadRequestException('Invalid sn');
    if (!filter) throw new BadRequestException('Invalid filter');
    const cache = await this.redis.get(`device_legacy_graph:${sn}${filter.split(',').join("")}`);
    if (cache) return JSON.parse(cache);
    let query = `from(bucket: "${process.env.INFLUXDB_BUCKET}") `;
    switch (filter) {
      case 'day':
        query += '|> range(start: -1d) ';
        break;
      case 'week':
        query += '|> range(start: -1w) ';
        break;
      case 'month':
        query += '|> range(start: -1mo) ';
        break;
      default:
        if (!filter.includes(',')) throw new BadRequestException('Invalid filter');
        const date = filter.split(',');
        query += `|> range(start: ${date[0]}, stop: ${date[1]}) `;
    };
    query += '|> filter(fn: (r) => r._measurement == "templog") |> timeShift(duration: 7h, columns: ["_time"]) ';
    query += `|> filter(fn: (r) => r._field == "temp" and r.sn == "${sn}") |> yield(name: "temp")`;
    const result = await this.influxdb.queryData(query);
    await this.redis.set(`device_legacy_graph:${sn}${filter.split(',').join("")}`, JSON.stringify(result), 10);
    return result;
  }
}
