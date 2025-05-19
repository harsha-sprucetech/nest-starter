import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';
import { DatabaseService } from '../services/database.service';

@ApiTags('admin/database')
@Controller('admin/database')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('truncate')
  @RequirePermissions({ resource: 'admin/database', action: 'manage' })
  async truncateAllTables() {
    await this.databaseService.truncateAllTables();
    return { message: 'All tables have been truncated successfully' };
  }

  @Post('reset-sequences')
  @RequirePermissions({ resource: 'admin/database', action: 'manage' })
  async resetSequences() {
    await this.databaseService.resetSequences();
    return { message: 'All sequences have been reset successfully' };
  }

  @Post('reset')
  @RequirePermissions({ resource: 'admin/database', action: 'manage' })
  async resetDatabase() {
    await this.databaseService.resetDatabase();
    return { message: 'Database has been reset successfully' };
  }
} 