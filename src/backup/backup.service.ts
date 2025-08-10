import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from 'date-fns';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  constructor(private readonly prisma: PrismaService) { }

  async sendBackup() {
    this.logger.log(`Sending backup At ${format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'")}`);
    let logCount = 0;
    let notificationCount = 0;
    const backup = await this.prisma.tempLogs.findMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      },
      orderBy: { createdAt: 'asc' }
    });
    if (backup.length === 0) {
      this.logger.log('No backup data found');
      return { log: 0, notification: 0 };
    }
    for (const log of backup) {
      if (log.isAlert) {
        notificationCount++;
      } else {
        logCount++;
      }
    }
    return { log: logCount, notification: notificationCount };
  }

  async deleteBackup(date: string) {
    this.logger.log(`Deleting backup At ${date}`);
    return this.prisma.tempLogs.deleteMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      }
    });
  }
}
