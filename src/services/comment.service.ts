import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  async create(userId: number, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId, deletedAt: IsNull() },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content: dto.content,
      postId: dto.postId,
      authorId: userId,
    });

    await this.commentRepository.save(comment);
    return this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findByPost(postId: number) {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoin('comment.likes', 'likes')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.deletedAt IS NULL')
      .select([
        'comment',
        'author.id',
        'author.name',
        'COUNT(DISTINCT likes.id) as likesCount',
      ])
      .groupBy('comment.id, author.id')
      .orderBy('comment.createdAt', 'DESC');

    const result = await queryBuilder.getRawAndEntities();
    const comments = result.entities;
    const raw = result.raw;

    return comments.map((comment, index) => ({
      ...comment,
      _count: {
        likes: parseInt(raw[index].likesCount),
      },
    }));
  }

  async update(userId: number, id: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Not authorized to update this comment');
    }

    await this.commentRepository.update(id, dto);

    return this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
        },
      },
    });
  }

  async remove(userId: number, id: number, isAdmin: boolean) {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!isAdmin && comment.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    comment.deletedAt = new Date();
    return this.commentRepository.save(comment);
  }

  async like(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId === userId) {
      throw new ForbiddenException('Cannot like your own comment');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, commentId, deletedAt: IsNull() },
    });

    if (existingLike) {
      throw new ForbiddenException('Already liked this comment');
    }

    const like = this.likeRepository.create({
      userId,
      commentId,
    });

    return this.likeRepository.save(like);
  }

  async unlike(userId: number, commentId: number) {
    const like = await this.likeRepository.findOne({
      where: { userId, commentId, deletedAt: IsNull() },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    like.deletedAt = new Date();
    return this.likeRepository.save(like);
  }
} 