import { Controller, Query, Get, Post, Body, Put, Param, Delete, HttpStatus, HttpCode, UseGuards, Request } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { JwtPayloadDto } from '../common/dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { OnlineDto } from './dto/online.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @EventPattern('onlinestatus')
  async onlineStatus(@Payload() data: OnlineDto, @Ctx() context: RmqContext) {
    this.handleMessage(
      async () => await this.deviceService.handleOnlineStatus(data),
      context,
      'onlinestatus',
      data,
    );
  }

  @Post()
  @Roles(Role.SUPER, Role.SERVICE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query('filter') filter: string, 
    @Query('ward') ward: string, 
    @Query('page') page: string, 
    @Query('perpage') perpage: string, 
    @Request() req: { user: JwtPayloadDto }
  ) {
    return this.deviceService.findAll(filter, ward, page, perpage, req.user);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/devices/list')
  async findDeviceList(@Request() req: { user: JwtPayloadDto }) {
    return this.deviceService.getDeviceList(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(id, updateDeviceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }

  /**
   * Generic message handler with proper error handling and logging
   */
  private async handleMessage<T>(
    operation: () => Promise<any>,
    context: RmqContext,
    operationName: string,
    payload: T,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    const startTime = Date.now();

    try {
      await operation();
      channel.ack(message);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Error in operation ${operationName}:`, {
        error: error.message,
        stack: error.stack,
        payload,
        duration,
      });
      
      // Reject message without requeue to prevent infinite loops
      // Consider implementing a dead letter queue in production
      channel.nack(message, false, false);
    }
  }
}
