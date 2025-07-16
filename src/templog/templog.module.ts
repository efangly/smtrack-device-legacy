import { Module } from '@nestjs/common';
import { TemplogService } from './templog.service';
import { TemplogController } from './templog.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [TemplogController],
  providers: [TemplogService]
})
export class TemplogModule {}
