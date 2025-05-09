import { Injectable } from '@nestjs/common';
import { JwtPayloadDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MobileService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async findNotification(device: string, user: JwtPayloadDto) {
    let conditions: Prisma.TempLogsWhereInput | undefined = undefined;
    let key = "";
    if (device) {
      conditions = { isAlert: true, mcuId: device };
      key = `mobile-templog:${device}`;
    } else {
      switch (user.role) {
        case "LEGACY_USER":
          conditions = { isAlert: true, device: { ward: user.wardId } };
          key = `mobile-templog:${user.wardId}`;
          break;
        case "LEGACY_ADMIN":
          conditions = { isAlert: true, device: { hospital: user.hosId } };
          key = `mobile-templog:${user.hosId}`;
          break;
        case "ADMIN":
          conditions = { isAlert: true, device: { hospital: user.hosId } };
          key = `mobile-templog:${user.hosId}`;
          break;
        case "SERVICE":
          conditions = { isAlert: true, NOT: { device: { hospital: "HID-DEVELOPMENT" } } };
          key = "mobile-templog:HID-DEVELOPMENT";
          break;
        default:
          conditions = { isAlert: true };
          key = "mobile-templog";
      }
    }
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache);
    const templogs = await this.prisma.tempLogs.findMany({
      take: 99,
      select: {
        mcuId: true,
        message: true,
        probe: true,
        device: { select: { name: true, wardName: true, hospitalName: true } },
        createdAt: true
      },
      where: conditions,
      orderBy: { createdAt: 'desc' }
    });
    if (templogs.length > 0) await this.redis.set(key, JSON.stringify(templogs), 30);
    return templogs;
  }

  async findDeviceByWard(ward: string) {
    const cache = await this.redis.get(`legacy-ward:${ward}`);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.devices.findMany({ 
      where: { ward: ward },
      select: { 
        id: true,
        sn: true, 
        name: true, 
        ward: true,
        hospital: true,
        log: { where: { isAlert: true } },
      } 
    });
    if (result.length > 0) await this.redis.set(`legacy-ward:${ward}`, JSON.stringify(result), 10);
    return result;
  }
}
