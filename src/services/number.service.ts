import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NumberEntity } from '../entities/number.entity';
import { CreateNumberDto } from '../dto/number.dto';
import { UpdateNumberDto } from '../dto/number.dto';

@Injectable()
export class NumberService {
  constructor(
    @InjectRepository(NumberEntity)
    private numberRepository: Repository<NumberEntity>,
  ) {}

  async create(createNumberDto: CreateNumberDto): Promise<NumberEntity> {
    const number = this.numberRepository.create(createNumberDto);
    return await this.numberRepository.save(number);
  }

  async findAll(): Promise<NumberEntity[]> {
    return await this.numberRepository.find();
  }

  async findOne(id: number): Promise<NumberEntity> {
    const number = await this.numberRepository.findOne({ where: { id } });
    if (!number) {
      throw new NotFoundException(`Number with ID ${id} not found`);
    }
    return number;
  }

  async update(id: number, updateNumberDto: UpdateNumberDto): Promise<NumberEntity> {
    const number = await this.findOne(id);
    this.numberRepository.merge(number, updateNumberDto);
    return await this.numberRepository.save(number);
  }

  async remove(id: number): Promise<void> {
    const number = await this.findOne(id);
    await this.numberRepository.remove(number);
  }
} 