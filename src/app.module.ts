import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DeviceModule } from './device/device.module';
import { TemplogModule } from './templog/templog.module';
import { DeviceStrategy, JwtStrategy } from './common/strategies';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { InfluxdbModule } from './influxdb/influxdb.module';
import { PrismaModule } from './prisma/prisma.module';
import { GraphModule } from './graph/graph.module';
import { BackupModule } from './backup/backup.module';
import { MobileModule } from './mobile/mobile.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    PassportModule,
    DeviceModule,
    TemplogModule,
    HealthModule,
    RedisModule,
    InfluxdbModule,
    PrismaModule,
    GraphModule,
    BackupModule,
    MobileModule,
    RabbitmqModule
  ],
  providers: [JwtStrategy, DeviceStrategy]
})
export class AppModule {}
