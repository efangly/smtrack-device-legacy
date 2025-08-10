import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../common/guards';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async sendBackup() {
    return this.backupService.sendBackup();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(id);
  }
}
