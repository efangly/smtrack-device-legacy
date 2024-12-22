import { Injectable, BadRequestException } from '@nestjs/common';
import { InfluxdbService } from '../influxdb/influxdb.service';

@Injectable()
export class GraphService {
  constructor(private readonly influxdb: InfluxdbService) {}
  async findAll(sn: string, filter: string) {
    let query = 'from(bucket: "smtrack-templog") ';
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
    query += ' |> filter(fn: (r) => r._measurement == "templog") |> timeShift(duration: 7h, columns: ["_time"]) ';
    query += `|> filter(fn: (r) => r._field == "temp" and r.sn == "${sn}") |> yield(name: "temp")`;
    return this.influxdb.queryData(query);
  }

  async findOne(id: string) {
    return `This action returns a #${id} graph`;
  }
}
