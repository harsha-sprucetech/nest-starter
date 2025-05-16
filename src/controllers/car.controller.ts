import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CarService } from '../services/car.service';
import { CreateCarDto, UpdateCarDto } from '../dto/car.dto';
import { CarEntity } from '../entities/car.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(@Body() createCarDto: CreateCarDto): Promise<CarEntity> {
    return this.carService.create(createCarDto);
  }

  @Get()
  findAll(): Promise<CarEntity[]> {
    return this.carService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CarEntity> {
    return this.carService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<CarEntity> {
    return this.carService.update(id, updateCarDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carService.remove(id);
  }
} 