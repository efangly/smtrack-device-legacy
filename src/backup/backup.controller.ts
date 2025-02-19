import { Controller, Delete, Get } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  async findAll() {
    return this.backupService.findBackup();
  }

  @Delete(':id')
  async remove() {
    return this.backupService.deleteBackup();
  }
}
