import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Post ID' })
  @IsNumber()
  postId: number;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;
} 