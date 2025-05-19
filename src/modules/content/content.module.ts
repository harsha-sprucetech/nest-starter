import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { LikeEntity } from './entities/like.entity';
import { UserEntity } from '../../entities/user.entity';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, CommentEntity, LikeEntity, UserEntity]),
  ],
  controllers: [PostController, CommentController],
  providers: [PostService, CommentService],
  exports: [PostService, CommentService],
})
export class ContentModule {} 