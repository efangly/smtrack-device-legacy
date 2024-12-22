import { IsString, MaxLength, IsOptional, IsDate, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDeviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  ward: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  hospital: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  sn: string;

  @IsOptional()
  @IsNumber()
  seq: number;
  
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsNumber()
  maxTemp: number;

  @IsOptional()
  @IsNumber()
  minTemp: number;

  @IsOptional()
  @IsNumber()
  adjTemp: number;

  @IsOptional()
  @IsNumber()
  record: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  token: string;
  
  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}
