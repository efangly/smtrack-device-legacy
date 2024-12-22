import { Module } from '@nestjs/common';
import { TemplogService } from './templog.service';
import { TemplogController } from './templog.controller';

@Module({
  controllers: [TemplogController],
  providers: [TemplogService],
})
export class TemplogModule {}
