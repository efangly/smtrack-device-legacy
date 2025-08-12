import { Injectable, BadRequestException } from '@nestjs/common';
import { InfluxdbService } from '../influxdb/influxdb.service';
import { RedisService } from '../redis/redis.service';
import e from 'express';

@Injectable()
export class GraphService {
  constructor(private readonly influxdb: InfluxdbService, private readonly redis: RedisService) { }

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
        if (sn.substring(0, 3) === 'TMS') {
          query += '|> aggregateWindow(every: 30m, fn: first, createEmpty: false) ';
        } else {
          query += '|> aggregateWindow(every: 15m, fn: first, createEmpty: false) ';
        }
        break;
      case 'month':
        query += '|> range(start: -1mo) ';
        if (sn.substring(0, 3) === 'TMS') {
          query += '|> aggregateWindow(every: 1h, fn: first, createEmpty: false) ';
        } else {
          query += '|> aggregateWindow(every: 30m, fn: first, createEmpty: false) ';
        }
        break;
      default:
        if (!filter.includes(',')) throw new BadRequestException('Invalid filter');
        const date = filter.split(',');
        query += `|> range(start: ${date[0]}, stop: ${date[1]}) `;
        if (sn.substring(0, 3) === 'TMS') {
          query += '|> aggregateWindow(every: 1h, fn: first, createEmpty: false) ';
        } else {
          query += '|> aggregateWindow(every: 30m, fn: first, createEmpty: false) ';
        }
    };
    query += '|> filter(fn: (r) => r._measurement == "templog") ';
    query += '|> timeShift(duration: 7h, columns: ["_time"]) ';
    query += `|> filter(fn: (r) => r._field == "temp" and r.sn == "${sn}") |> yield(name: "temp")`;
    const result = await this.influxdb.queryData(query);
    if (result.length > 0) await this.redis.set(`device_legacy_graph:${sn}${filter.split(',').join("")}`, JSON.stringify(result), 1800);
    return result;
  }

  async dailyResult(date: string) {
    const reqQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}") 
      |> range(start: ${date}T00:00:00Z, stop: ${date}T23:59:59Z) 
      |> filter(fn: (r) => r._measurement == "templog") 
      |> filter(fn: (r) => r._field == "temp")
      |> group(columns: ["sn"])
      |> timeShift(duration: 7h, columns: ["_time"]) 
      |> aggregateWindow(every: 5m, fn: count, createEmpty: false)
      |> filter(fn: (r) => r._value > 5)
      |> count(column: "_value")`;
    const notiQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}") 
      |> range(start: ${date}T00:00:00Z, stop: ${date}T23:59:59Z) 
      |> filter(fn: (r) => r._measurement == "templog-alert") 
      |> filter(fn: (r) => r._field == "message")
      |> group(columns: ["sn"])
      |> timeShift(duration: 7h, columns: ["_time"]) 
      |> count(column: "_value")`;
    const requests = await this.influxdb.queryData(reqQuery);
    const notifications = await this.influxdb.queryData(notiQuery);
    const result: Record<string, { sn: string; freq?: number; notification?: number }> = {};
    requests.filter((r) => !r.sn.startsWith("TMS")).forEach((r) => { result[r.sn] = { sn: r.sn, freq: r._value }; });
    notifications.forEach((r) => {
      if (result[r.sn]) {
        result[r.sn].notification = r._value;
      } else {
        result[r.sn] = { sn: r.sn, notification: r._value };
      }
    });
    return Object.values(result);
  }
}
