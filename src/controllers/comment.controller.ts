import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { PermissionGuard, RequirePermissions } from '../guards/permission.guard';

@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @RequirePermissions({ resource: 'comments', action: 'create' })
  create(@User('id') userId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(userId, createCommentDto);
  }

  @Get('post/:postId')
  @RequirePermissions({ resource: 'comments', action: 'read' })
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.findByPost(postId);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'comments', action: 'update' })
  update(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(userId, id, updateCommentDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'comments', action: 'delete' })
  remove(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentService.remove(userId, id, true);
  }

  @Post(':id/like')
  @RequirePermissions({ resource: 'comments', action: 'like' })
  like(@User('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.like(userId, commentId);
  }

  @Delete(':id/like')
  @RequirePermissions({ resource: 'comments', action: 'unlike' })
  unlike(@User('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.unlike(userId, commentId);
  }
} 