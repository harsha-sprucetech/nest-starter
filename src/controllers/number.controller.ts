import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NumberService } from '../services/number.service';
import { CreateNumberDto, UpdateNumberDto } from '../dto/number.dto';
import { NumberEntity } from '../entities/number.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('numbers')
export class NumberController {
  constructor(private readonly numberService: NumberService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createNumberDto: CreateNumberDto): Promise<NumberEntity> {
    return this.numberService.create(createNumberDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  findAll(): Promise<NumberEntity[]> {
    return this.numberService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NumberEntity> {
    return this.numberService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNumberDto: UpdateNumberDto,
  ): Promise<NumberEntity> {
    return this.numberService.update(id, updateNumberDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.numberService.remove(id);
  }
} 