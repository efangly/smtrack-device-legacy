import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ JwtModule.register({ global: true }) ],
  controllers: [DeviceController],
  providers: [DeviceService]
})
export class DeviceModule {}
