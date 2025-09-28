import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { JsonLogger } from '../common/logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new JsonLogger();
  async set(key: string, value: string, expire: number): Promise<void> {
    try {
      await this.client.setEx(key, expire, value);
    } catch (error) {
      this.logger.error('Redis set error', error);
      return;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const dataSet = await this.client.get(key);
      if (typeof dataSet === 'string') {
        return dataSet;
      } else {
        return null;
      }
    } catch (error) {
      this.logger.error('Redis get error', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const dataSet = await this.client.keys(`${key}*`);
      if (dataSet.length > 0) await this.client.del(dataSet);
    } catch (error) {
      this.logger.error('Redis del error', error);
      return;
    }
  }

  async canRequest(deviceId: string): Promise<number> {
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const roundedMinutes = Math.floor(minutes / 5) * 5;
    const timeKey = `${now.getUTCFullYear()}${now.getUTCMonth() + 1}${now.getUTCDate()}${now.getUTCHours()}${roundedMinutes}`;
    const key = `ratelimit:${deviceId}:${timeKey}`;
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, 300);
    return count;
  }

  async onModuleInit() {
    this.client = createClient({ 
      url: process.env.RADIS_HOST, 
      password: process.env.RADIS_PASSWORD,
      socket: {
        reconnectStrategy: 5000
      }
    });
    try {
      await this.client.connect();
      await this.client.flushAll();
    } catch (error) {
      this.logger.error(`Redis connection error: ${error}`);  
    }
    this.client.on('error', (error) => {
      this.logger.error(`Redis error: ${error}`);
    });
    this.client.on('reconnecting', () => {
      // Regular log removed - only warn/error logs are output
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
