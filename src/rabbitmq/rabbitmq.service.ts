import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    @Inject('BACKUP_SERVICE') private readonly backupClient: ClientProxy
  ) {}

  sendTemplog<T>(data: T) {
    this.client.emit('templog', data);
  }

  sendBackup<T>(pattern: string, data: T) {
    this.backupClient.emit(pattern, data);
  }
}