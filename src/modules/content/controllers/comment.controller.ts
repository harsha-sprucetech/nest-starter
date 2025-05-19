import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { User } from '../../../decorators/user.decorator';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { UserEntity } from '../../../entities/user.entity';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @RequirePermissions({ resource: 'comments', action: 'create' })
  async create(@Body() createCommentDto: CreateCommentDto, @User() user: UserEntity) {
    return this.commentService.create(user.id, createCommentDto);
  }

  @Get()
  @RequirePermissions({ resource: 'comments', action: 'read' })
  async findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'comments', action: 'read' })
  async findOne(@Param('id') id: string) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  @Put(':id')
  @RequirePermissions({ resource: 'comments', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @User() user: UserEntity,
  ) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only update your own comments');
    }
    return this.commentService.update(user.id, +id, updateCommentDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'comments', action: 'delete' })
  async remove(@Param('id') id: string, @User() user: UserEntity) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    return this.commentService.remove(user.id, +id);
  }

  @Post(':id/like')
  @RequirePermissions({ resource: 'comments', action: 'like' })
  async likeComment(@Param('id') id: string, @User() user: UserEntity) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.commentService.like(user.id, +id);
  }

  @Delete(':id/like')
  @RequirePermissions({ resource: 'comments', action: 'unlike' })
  async unlikeComment(@Param('id') id: string, @User() user: UserEntity) {
    const comment = await this.commentService.findOne(+id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.commentService.unlike(user.id, +id);
  }
} 