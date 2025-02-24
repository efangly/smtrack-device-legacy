import { Module } from '@nestjs/common';
import { TemplogService } from './templog.service';
import { TemplogController } from './templog.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ || 'amqp://admin:thanesmail1234@siamatic.co.th:5672'],
          queue: 'templog_queue',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  controllers: [TemplogController],
  providers: [TemplogService],
})
export class TemplogModule {}
