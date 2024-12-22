import { Controller, Query, Get, Post, Body, Put, Param, Delete, HttpStatus, HttpCode, UseGuards, Request } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { JwtPayloadDto } from '../common/dto';

@Controller('device')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @Roles(Role.SUPER, Role.SERVICE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Get()
  async findAll(@Query('ward') ward: string, @Query('page') page: string, @Query('perpage') perpage: string, @Request() req: { user: JwtPayloadDto }) {
    return this.deviceService.findAll(ward, page, perpage, req.user);
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }
}
