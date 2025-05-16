import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Post body content' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Whether the post is published', default: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export class UpdatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Post body content' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'Whether the post is published' })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export class PostQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
} 