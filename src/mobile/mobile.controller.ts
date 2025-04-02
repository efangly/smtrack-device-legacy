import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '../common/guards';
import { JwtPayloadDto } from '../common/dto';

@Controller('mobile')
@UseGuards(JwtAuthGuard)
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get()
  async findAll(@Query('device') device: string, @Request() req: { user: JwtPayloadDto }) {
    return this.mobileService.findNotification(device, req.user);
  }

  @Get(':ward')
  async findOne(@Param('ward') ward: string) {
    return this.mobileService.findDeviceByWard(ward);
  }
}
