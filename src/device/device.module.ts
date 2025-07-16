import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { JwtModule } from '@nestjs/jwt';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [ JwtModule.register({ global: true }), RabbitmqModule ],
  controllers: [DeviceController],
  providers: [DeviceService]
})
export class DeviceModule {}
