import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DevicePayloadDto } from '../dto';

@Injectable()
export class DeviceStrategy extends PassportStrategy(Strategy, 'device-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.DEVICE_SECRET, 
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<DevicePayloadDto> {
    return { id: payload.sn, hosId: payload.hosId, wardId: payload.wardId };
  }
}