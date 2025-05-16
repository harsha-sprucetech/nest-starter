import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from '../dto/post.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../entities/role.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@User('id') userId: number, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(userId, createPostDto);
  }

  @Get()
  findAll(@Query() query: PostQueryDto) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(userId, id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  remove(
    @User('id') userId: number,
    @User('role') role: Role,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postService.remove(userId, id, role === Role.ADMIN);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  like(@User('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.like(userId, postId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unlike(@User('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.unlike(userId, postId);
  }
} 