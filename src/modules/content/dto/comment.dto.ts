import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The ID of the post this comment belongs to' })
  @IsNumber()
  @IsNotEmpty()
  postId: number;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'The content of the comment', required: false })
  @IsString()
  @IsOptional()
  content?: string;
} 