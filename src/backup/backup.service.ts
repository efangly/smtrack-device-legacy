import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from 'date-fns';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async findBackup() {
    return this.prisma.tempLogs.findMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async deleteBackup() {
    return this.prisma.tempLogs.deleteMany({
      where: {
        createdAt: { lt: toDate(format(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), "yyyy-MM-dd'T'HH:mm:ss'Z'")) }
      }
    });
  }
}
