import { IsInt } from 'class-validator';

export class CreateNumberDto {
  @IsInt()
  value: number;
}

export class UpdateNumberDto {
  @IsInt()
  value: number;
} 