import { IsString, MaxLength } from 'class-validator';

export class DevicePayloadDto {
  @IsString()
  @MaxLength(150)
  id: string;

  @IsString()
  @MaxLength(150)
  hosId: string;

  @IsString()
  @MaxLength(150)
  wardId: string;
}