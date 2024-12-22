import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, 
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<JwtPayloadDto> {
    return { id: payload.id, role: payload.role, hosId: payload.hosId, wardId: payload.wardId };
  }
}