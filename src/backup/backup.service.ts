import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from 'date-fns';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(BackupService.name);
  @Cron('0 0 * * *')
  async deleteBackup() {
    this.logger.log(`Deleting backup At ${format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")}`);
    return this.prisma.tempLogs.deleteMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      }
    });
  }
}
