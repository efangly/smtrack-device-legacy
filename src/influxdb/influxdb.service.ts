import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { InfluxRow } from 'src/common/types';

@Injectable()
export class InfluxdbService implements OnModuleInit {
  private readonly org = process.env.INFLUXDB_ORG;
  private readonly bucket = process.env.INFLUXDB_BUCKET;
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  constructor(@Inject('INFLUXDB') private readonly influxDB: InfluxDB) {}

  async writeData(measurement: string, fields: string, tags: Record<string, string>) {
    const point = `${measurement},${this.formatTags(tags)} ${fields}`;
    this.writeApi.writeRecord(point);
    await this.writeApi.flush();
  }

  async queryData(fluxQuery: string) {
    const results: InfluxRow[] = [];
    return new Promise<InfluxRow[]>((resolve, reject) => {
      this.queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const data = tableMeta.toObject(row) as InfluxRow; 
          results.push(data);
        },
        error: reject,
        complete: () => resolve(results),
      });
    });
  }

  onModuleInit() {
    this.writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
    this.queryApi = this.influxDB.getQueryApi(this.org);
  }

  private formatTags(tags: Record<string, string>): string {
    return Object.entries(tags).map(([key, value]) => `${key}=${value}`).join(',');
  }
}
