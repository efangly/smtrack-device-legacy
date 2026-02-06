import { IsString, MaxLength, IsOptional, IsDate, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class OnlineDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  status: string;

  @IsOptional()
  @IsNumber()
  ts: number;
}