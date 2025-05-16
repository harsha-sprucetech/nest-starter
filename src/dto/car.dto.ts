import { IsString, IsDate, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  dateOfRelease: Date;

  @IsBoolean()
  isInProduction: boolean;
}

export class UpdateCarDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  dateOfRelease: Date;

  @IsBoolean()
  isInProduction: boolean;
} 