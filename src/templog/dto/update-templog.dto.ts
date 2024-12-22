import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplogDto } from './create-templog.dto';

export class UpdateTemplogDto extends PartialType(CreateTemplogDto) {}
