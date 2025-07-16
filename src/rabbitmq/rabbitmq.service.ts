import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    @Inject('MONITOR_SERVICE') private readonly monitorClient: ClientProxy,
  ) {}

  sendTemplog<T>(data: T) {
    this.client.emit('templog', data);
  }

  sendMonitor<T>(pattern: string, data: T) {
    this.monitorClient.emit(pattern, data);
  }
}