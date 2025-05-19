import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CarService } from '../services/car.service';
import { CreateCarDto, UpdateCarDto } from '../dto/car.dto';
import { CarEntity } from '../entities/car.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../guards/permission.guard';

@ApiTags('cars')
@Controller('cars')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @RequirePermissions({ resource: 'cars', action: 'create' })
  create(@Body() createCarDto: CreateCarDto): Promise<CarEntity> {
    return this.carService.create(createCarDto);
  }

  @Get()
  @RequirePermissions({ resource: 'cars', action: 'read' })
  findAll(): Promise<CarEntity[]> {
    return this.carService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'cars', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CarEntity> {
    return this.carService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'cars', action: 'update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<CarEntity> {
    return this.carService.update(id, updateCarDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'cars', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carService.remove(id);
  }
} 