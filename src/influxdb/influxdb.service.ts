import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import { InfluxRow } from 'src/common/types';

@Injectable()
export class InfluxdbService implements OnModuleInit {
  private readonly org = process.env.INFLUXDB_ORG;
  private queryApi: QueryApi;

  constructor(@Inject('INFLUXDB') private readonly influxDB: InfluxDB) {}

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
    this.queryApi = this.influxDB.getQueryApi(this.org);
  }
}
