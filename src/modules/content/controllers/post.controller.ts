import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { User } from '../../../decorators/user.decorator';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @RequirePermissions({ resource: 'posts', action: 'create' })
  create(@User('id') userId: number, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(userId, createPostDto);
  }

  @Get()
  @RequirePermissions({ resource: 'posts', action: 'read' })
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'posts', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'posts', action: 'update' })
  update(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(userId, id, updatePostDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'posts', action: 'delete' })
  remove(@User('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(userId, id);
  }

  @Post(':id/like')
  @RequirePermissions({ resource: 'posts', action: 'like' })
  like(@User('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.like(userId, postId);
  }

  @Delete(':id/like')
  @RequirePermissions({ resource: 'posts', action: 'unlike' })
  unlike(@User('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.unlike(userId, postId);
  }
} 