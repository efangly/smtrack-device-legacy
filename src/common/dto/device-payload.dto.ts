import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

export class DevicePayloadDto {
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  id: string;

  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  hosId: string;

  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  wardId: string;
}