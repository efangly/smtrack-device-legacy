import { IsString, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class InfluxdbDto {
  @IsNumber()
  temp: number;

  @IsNumber()
  realTemp: number;

  @IsBoolean()
  door: boolean;

  @IsBoolean()
  plug: boolean;

  @IsString()
  @MaxLength(255)
  notification: string;
}