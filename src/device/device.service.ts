import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly redis: RedisService,
    private readonly jwtService: JwtService
  ) {}
  async create(deviceDto: CreateDeviceDto) {
    const device = await this.prisma.devices.findUnique({ where: { sn: deviceDto.sn } });
    if (device) throw new BadRequestException('Device already exists');
    const seq = await this.prisma.devices.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
    deviceDto.seq = seq.length === 0 ? 1 : seq[0].seq + 1;
    deviceDto.token = this.jwtService.sign({ 
      sn: deviceDto.sn, 
      ward: deviceDto.ward, 
      hospital: deviceDto.hospital 
    }, { 
      secret: process.env.DEVICE_SECRET 
    });
    deviceDto.createdAt = dateFormat(new Date());
    deviceDto.updatedAt = dateFormat(new Date());
    await this.redis.del('device_legacy');
    return this.prisma.devices.create({ data: deviceDto });
  }

  async findAll(wardId: string, page: string, perpage: string, user: JwtPayloadDto) {
    const pageInt = page ? (parseInt(page) - 1) * parseInt(perpage) : 0;
    const perpageInt = perpage ? parseInt(perpage) : 10;
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(`${key}-${wardId ? wardId : ''}${pageInt.toString()}${perpageInt.toString()}`);
    if (cache) return JSON.parse(cache);
    const [devices, total] = await this.prisma.$transaction([
      page && perpage ? this.prisma.devices.findMany({ 
        skip: pageInt, 
        take: perpageInt,
        where: wardId ? { ward: wardId } : conditions, 
        select: { 
          id: true,
          sn: true, 
          name: true, 
          ward: true,
          hospital: true,
          maxTemp: true,
          minTemp: true,
          adjTemp: true,
          record: true,
          token: true,
          log: { where: { isAlert: false }, take: 1, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { seq: 'asc' } 
      }) : this.prisma.devices.findMany({ 
        where: wardId ? { ward: wardId } : conditions, 
        select: { 
          id: true,
          sn: true, 
          name: true, 
          ward: true,
          hospital: true,
          maxTemp: true,
          minTemp: true,
          adjTemp: true,
          record: true,
          log: { where: { isAlert: false }, take: 1, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { seq: 'asc' } 
      }),
      this.prisma.devices.count({ where: wardId ? { ward: wardId } : conditions })
    ]);
    await this.redis.set(`${key}-${wardId ? wardId : ''}${pageInt.toString()}${perpageInt.toString()}`, JSON.stringify({ total, devices }), 10);
    return { total, devices };
  }

  async findOne(id: string) {
    const cache = await this.redis.get(`device_legacy:${id}`);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.devices.findUnique({ 
      where: { sn: id },
      select: { 
        id: true,
        sn: true, 
        name: true, 
        ward: true,
        hospital: true,
        maxTemp: true,
        minTemp: true,
        adjTemp: true,
        record: true,
        log: { where: { isAlert: false }, orderBy: { createdAt: 'asc' } }
      } 
    });
    if (result) await this.redis.set(`device_legacy:${id}`, JSON.stringify(result), 15);
    return result;
  }

  async getDeviceList(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.devices.findMany({ 
      where: conditions,
      select: { 
        id: true,
        sn: true, 
        name: true, 
        ward: true,
        hospital: true
      },
      orderBy: { seq: 'asc' } 
    });
    if (result) await this.redis.set(key, JSON.stringify(result), 10);
    return result;
  }

  async update(id: string, deviceDto: UpdateDeviceDto) {
    deviceDto.updatedAt = dateFormat(new Date());
    await this.redis.del('device_legacy');
    return this.prisma.devices.update({ where: { id }, data: deviceDto });
  }

  async remove(id: string) {
    await this.redis.del('device_legacy');
    return this.prisma.devices.delete({ where: { sn: id } });
  }

  private findCondition (user: JwtPayloadDto): { conditions: Prisma.DevicesWhereInput | undefined, key: string } {
    let conditions: Prisma.DevicesWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "LEGACY_USER":
        conditions = { ward: user.wardId };
        key = `device_legacy:${user.wardId}`;
        break;
      case "LEGACY_ADMIN":
        conditions = { hospital: user.hosId  };
        key = `device_legacy:${user.hosId}`;
        break;
      case "SERVICE":
        conditions = { NOT: { hospital: "HID-DEVELOPMENT" } };
        key = "device_legacy:HID-DEVELOPMENT";
        break;
      default:
        conditions = undefined;
        key = "device_legacy";
    }
    return { conditions, key };
  }
}
