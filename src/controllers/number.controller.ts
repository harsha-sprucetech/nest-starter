import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NumberService } from '../services/number.service';
import { CreateNumberDto, UpdateNumberDto } from '../dto/number.dto';
import { NumberEntity } from '../entities/number.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../guards/permission.guard';

@ApiTags('numbers')
@Controller('numbers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class NumberController {
  constructor(private readonly numberService: NumberService) {}

  @Post()
  @RequirePermissions({ resource: 'numbers', action: 'create' })
  create(@Body() createNumberDto: CreateNumberDto): Promise<NumberEntity> {
    return this.numberService.create(createNumberDto);
  }

  @Get()
  @RequirePermissions({ resource: 'numbers', action: 'read' })
  findAll(): Promise<NumberEntity[]> {
    return this.numberService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'numbers', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NumberEntity> {
    return this.numberService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'numbers', action: 'update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNumberDto: UpdateNumberDto,
  ): Promise<NumberEntity> {
    return this.numberService.update(id, updateNumberDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'numbers', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.numberService.remove(id);
  }
} 