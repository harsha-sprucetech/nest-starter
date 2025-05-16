import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarEntity } from '../entities/car.entity';
import { CreateCarDto, UpdateCarDto } from '../dto/car.dto';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(CarEntity)
    private carRepository: Repository<CarEntity>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<CarEntity> {
    const car = this.carRepository.create(createCarDto);
    return await this.carRepository.save(car);
  }

  async findAll(): Promise<CarEntity[]> {
    return await this.carRepository.find();
  }

  async findOne(id: number): Promise<CarEntity> {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return car;
  }

  async update(id: number, updateCarDto: UpdateCarDto): Promise<CarEntity> {
    const car = await this.findOne(id);
    this.carRepository.merge(car, updateCarDto);
    return await this.carRepository.save(car);
  }

  async remove(id: number): Promise<void> {
    const car = await this.findOne(id);
    await this.carRepository.remove(car);
  }
} 