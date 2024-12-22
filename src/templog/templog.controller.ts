import { Controller, Get, Post, Body, Put, Param, Delete, HttpCode, HttpStatus, Query, UseGuards, Request } from '@nestjs/common';
import { TemplogService } from './templog.service';
import { CreateTemplogDto } from './dto/create-templog.dto';
import { UpdateTemplogDto } from './dto/update-templog.dto';
import { DeviceJwtAuthGuard, JwtAuthGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';
import { JwtPayloadDto } from '../common/dto';

@Controller('templog')
export class TemplogController {
  constructor(private readonly templogService: TemplogService) {}

  @Post()
  @UseGuards(DeviceJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTemplogDto: CreateTemplogDto) {
    createTemplogDto.isAlert = false;
    return this.templogService.create(createTemplogDto);
  }

  @Post('alert/notification')
  @UseGuards(DeviceJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createWithAlert(@Body() createTemplogDto: CreateTemplogDto) {
    createTemplogDto.isAlert = true;
    return this.templogService.create(createTemplogDto);
  }

  @Get('alert/notification')
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: { user: JwtPayloadDto }) {
    return this.templogService.findAll(req.user);
  }

  @Get('dashboard/count')
  @UseGuards(JwtAuthGuard)
  async findDashboard(@Query('ward') ward: string) {
    return this.templogService.findDashboard(ward);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.templogService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER, Role.SERVICE)
  async update(@Param('id') id: string, @Body() updateTemplogDto: UpdateTemplogDto) {
    return this.templogService.update(id, updateTemplogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER, Role.SERVICE)
  async remove(@Param('id') id: string) {
    return this.templogService.remove(id);
  }
}
