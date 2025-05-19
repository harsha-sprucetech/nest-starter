import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { UserEntity } from '../../../entities/user.entity';
import { LikeEntity } from '../entities/like.entity';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
      body: createPostDto.body,
      author: user,
    });

    return this.postRepository.save(post);
  }

  async findAll() {
    return this.postRepository.find({
      relations: ['author', 'likes'],
    });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'likes'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(userId: number, id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(userId: number, id: number) {
    const post = await this.findOne(id);

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully' };
  }

  async like(userId: number, postId: number) {
    const post = await this.findOne(postId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existingLike) {
      throw new ForbiddenException('You have already liked this post');
    }

    const like = this.likeRepository.create({
      user,
      post,
    });

    await this.likeRepository.save(like);
    return { message: 'Post liked successfully' };
  }

  async unlike(userId: number, postId: number) {
    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);
    return { message: 'Post unliked successfully' };
  }
} 