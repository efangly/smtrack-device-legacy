import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GraphService } from './graph.service';
import { JwtAuthGuard } from '../common/guards';

@Controller('graph')
@UseGuards(JwtAuthGuard)
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get()
  findAll(@Query('sn') sn: string, @Query('filter') filter: string) {
    return this.graphService.findAll(sn, filter);
  }
}
