import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The body content of the post' })
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdatePostDto {
  @ApiProperty({ description: 'The title of the post', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'The body content of the post', required: false })
  @IsString()
  @IsOptional()
  body?: string;
} 