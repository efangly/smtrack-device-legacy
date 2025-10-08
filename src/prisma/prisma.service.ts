import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { JsonLogger } from 'src/common/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new JsonLogger();
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      if (error instanceof PrismaClientInitializationError) {
        this.logger.logError('Prisma connection error ' + error.errorCode, undefined, 'PrismaService',{
          status: error.errorCode,
          error: error.message
        });
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}