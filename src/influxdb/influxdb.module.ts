import { Module, Global } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';
import { InfluxdbService } from './influxdb.service';

@Global()
@Module({
  providers: [
    {
      provide: 'INFLUXDB',
      useFactory: () => {
        const url = process.env.INFLUXDB_URI;
        const token = process.env.INFLUXDB_TOKEN;
        return new InfluxDB({ url, token, transportOptions: { timeout: 60000 } });
      },
    },
    InfluxdbService,
  ],
  exports: ['INFLUXDB', InfluxdbService],
})
export class InfluxdbModule {}