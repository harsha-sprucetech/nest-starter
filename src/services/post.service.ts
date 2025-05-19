import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeORMLike, IsNull, Not } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  async create(userId: number, dto: CreatePostDto) {
    const post = this.postRepository.create({
      ...dto,
      authorId: userId,
    });

    await this.postRepository.save(post);
    return this.postRepository.findOne({
      where: { id: post.id },
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findAll(query: PostQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoin('post.comments', 'comments')
      .leftJoin('post.likes', 'likes')
      .where('post.published = :published', { published: true })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post',
        'author.id',
        'author.name',
        'COUNT(DISTINCT comments.id) as commentsCount',
        'COUNT(DISTINCT likes.id) as likesCount',
      ])
      .groupBy('post.id, author.id');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(post.title) LIKE LOWER(:search) OR LOWER(post.body) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const [posts, total] = await Promise.all([
      queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('post.createdAt', 'DESC')
        .getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const postsWithCounts = posts.entities.map((post, index) => ({
      ...post,
      _count: {
        comments: parseInt(posts.raw[index].commentsCount),
        likes: parseInt(posts.raw[index].likesCount),
      },
    }));

    return {
      posts: postsWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoin('post.comments', 'comments')
      .leftJoin('post.likes', 'likes')
      .where('post.id = :id', { id })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post',
        'author.id',
        'author.name',
        'COUNT(DISTINCT comments.id) as commentsCount',
        'COUNT(DISTINCT likes.id) as likesCount',
      ])
      .groupBy('post.id, author.id');

    const { entities: post, raw } = await queryBuilder.getRawAndEntities();

    if (!post.length) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post[0],
      _count: {
        comments: parseInt(raw[0].commentsCount),
        likes: parseInt(raw[0].likesCount),
      },
    };
  }

  async update(userId: number, id: number, dto: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to update this post');
    }

    await this.postRepository.update(id, dto);

    return this.postRepository.findOne({
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
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!isAdmin && post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    post.deletedAt = new Date();
    return this.postRepository.save(post);
  }

  async like(userId: number, postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId, deletedAt: IsNull() },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId === userId) {
      throw new ForbiddenException('Cannot like your own post');
    }

    // Check for both active and soft-deleted likes
    const existingLike = await this.likeRepository.findOne({
      where: [
        { userId, postId, deletedAt: IsNull() },
        { userId, postId, deletedAt: Not(IsNull()) }
      ],
    });

    if (existingLike) {
      if (existingLike.deletedAt) {
        // If the like was soft-deleted, restore it
        existingLike.deletedAt = null as any;
        return this.likeRepository.save(existingLike);
      }
      throw new ForbiddenException('Already liked this post');
    }

    const like = this.likeRepository.create({
      userId,
      postId,
    });

    return this.likeRepository.save(like);
  }

  async unlike(userId: number, postId: number) {
    const like = await this.likeRepository.findOne({
      where: {
        userId,
        postId,
        deletedAt: IsNull(),
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    like.deletedAt = new Date();
    return this.likeRepository.save(like);
  }
} 