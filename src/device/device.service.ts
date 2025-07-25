import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto';
import { Prisma } from '@prisma/client';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService
  ) { }
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
    const result = await this.prisma.devices.create({ data: deviceDto });
    this.rabbitmq.sendMonitor('create-device', {
      id: device.sn,
      sn: device.sn,
      ward: device.ward,
      wardName: device.wardName,
      hospital: device.hospital,
      hospitalName: device.hospitalName,
      seq: device.seq,
      name: device.name
    });
    await this.redis.del('device_legacy');
    return result;
  }

  async findAll(filter: string, wardId: string, page: string, perpage: string, user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    let search = {} as Prisma.DevicesWhereInput;
    if (filter) {
      search = {
        OR: [
          { name: { contains: filter } },
          { sn: { contains: filter } },
          { wardName: { contains: filter } },
          { hospitalName: { contains: filter } }
        ]
      };
    } else {
      const cache = await this.redis.get(wardId ? `device_legacy:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`);
      if (cache) return JSON.parse(cache);
    }
    const [devices, total] = await this.prisma.$transaction([
      this.prisma.devices.findMany({
        skip: page ? (parseInt(page) - 1) * parseInt(perpage) : 0,
        take: perpage ? parseInt(perpage) : 10,
        where: filter ? { AND: [wardId ? { OR: [{ ward: wardId }, { hospital: wardId }] } : conditions, search] } : wardId ? { OR: [{ ward: wardId }, { hospital: wardId }] } : conditions,
        select: {
          id: true,
          sn: true,
          name: true,
          ward: true,
          wardName: true,
          hospital: true,
          hospitalName: true,
          maxTemp: true,
          minTemp: true,
          adjTemp: true,
          record: true,
          token: true,
          log: { where: { isAlert: false }, take: 1, orderBy: { createdAt: 'desc' } }
        },
        orderBy: { seq: 'asc' }
      }),
      this.prisma.devices.count({ where: filter ? { AND: [wardId ? { OR: [{ ward: wardId }, { hospital: wardId }] } : conditions, search] } : wardId ? { OR: [{ ward: wardId }, { hospital: wardId }] } : conditions })
    ]);
    if (devices.length > 0 && !filter) await this.redis.set(wardId ? `device_legacy:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`, JSON.stringify({ total, devices }), 10);
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
        wardName: true,
        hospital: true,
        hospitalName: true,
        maxTemp: true,
        minTemp: true,
        adjTemp: true,
        record: true,
        log: { where: { isAlert: false }, orderBy: { createdAt: 'desc' } }
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
        seq: true,
        name: true,
        ward: true,
        wardName: true,
        hospital: true,
        hospitalName: true
      },
      orderBy: { seq: 'asc' }
    });
    if (result.length > 0) await this.redis.set(key, JSON.stringify(result), 10);
    return result;
  }

  async update(id: string, deviceDto: UpdateDeviceDto) {
    deviceDto.updatedAt = dateFormat(new Date());
    const device = await this.prisma.devices.update({ where: { id }, data: deviceDto });
    await this.redis.del('device_legacy');
    return device;
  }

  async remove(id: string) {
    await this.prisma.devices.delete({ where: { sn: id } });
    await this.redis.del('device_legacy');
    return 'Device deleted successfully';
  }

  private findCondition(user: JwtPayloadDto): { conditions: Prisma.DevicesWhereInput | undefined, key: string } {
    let conditions: Prisma.DevicesWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "LEGACY_USER":
        conditions = { ward: user.wardId };
        key = `device_legacy:${user.wardId}`;
        break;
      case "LEGACY_ADMIN":
        conditions = { hospital: user.hosId };
        key = `device_legacy:${user.hosId}`;
        break;
      case "ADMIN":
        conditions = { hospital: user.hosId };
        key = `device_legacy:${user.hosId}`;
        break;
      case "SERVICE":
        conditions = { NOT: { hospital: "HID-DEVELOPMENT" } };
        key = "device_legacy:HID-DEVELOPMENT";
        break;
      default:
        conditions = {
          NOT: [
            { hospital: "0" },
          ]
        };
        key = "device_legacy";
    }
    return { conditions, key };
  }
}
