import { IsString, MaxLength } from 'class-validator';

export class JwtPayloadDto {
  @IsString()
  @MaxLength(150)
  id: string;

  @IsString()
  @MaxLength(150)
  role: string;

  @IsString()
  @MaxLength(150)
  hosId: string;

  @IsString()
  @MaxLength(150)
  wardId: string;
}