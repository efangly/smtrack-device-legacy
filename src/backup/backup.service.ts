import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from 'date-fns';
import { JsonLogger } from '../common/logger';

@Injectable()
export class BackupService {
  private readonly logger = new JsonLogger();
  constructor(private readonly prisma: PrismaService) { }

  async sendBackup() {
    let logCount = 0;
    let notificationCount = 0;
    const backup = await this.prisma.tempLogs.findMany({
      select: { isAlert: true },
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      }
    });
    if (backup.length === 0) {
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
    // Regular log statements removed - only warn/error logs are output
    return this.prisma.tempLogs.deleteMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      }
    });
  }
}
