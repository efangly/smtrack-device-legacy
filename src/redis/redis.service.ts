import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async set(key: string, value: string, expire: number): Promise<void> {
    await this.client.setEx(key, expire, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    const dataSet = await this.client.keys(`${key}*`);
    if (dataSet.length > 0) await this.client.del(dataSet);
  }

  async onModuleInit() {
    this.client = createClient({ 
      url: process.env.RADIS_HOST, 
      password: process.env.RADIS_PASSWORD 
    });
    await this.client.connect();
    await this.client.flushAll();
    this.client.on('error', (error) => {
      console.log('Redis client', error);
      setTimeout(() => { 
        console.log('Redis client reconnect...');
        this.onModuleInit(); 
      }, 5000);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
