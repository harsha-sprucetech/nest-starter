import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../../../entities/user.entity';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.postRepository.findOne({ where: { id: createCommentDto.postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      author: user,
      post: post,
    });

    return this.commentRepository.save(comment);
  }

  async findAll() {
    return this.commentRepository.find({
      relations: ['author', 'post', 'likes'],
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'post', 'likes'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(userId: number, id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(userId: number, id: number) {
    const comment = await this.findOne(id);

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async like(userId: number, commentId: number) {
    const comment = await this.findOne(commentId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (existingLike) {
      throw new ForbiddenException('You have already liked this comment');
    }

    const like = this.likeRepository.create({
      user,
      comment,
    });

    await this.likeRepository.save(like);
    return { message: 'Comment liked successfully' };
  }

  async unlike(userId: number, commentId: number) {
    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);
    return { message: 'Comment unliked successfully' };
  }
} 