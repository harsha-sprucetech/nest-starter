import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../../entities/user.entity';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.likes)
  user: UserEntity;

  @ManyToOne(() => PostEntity, post => post.likes, { nullable: true })
  post: PostEntity;

  @ManyToOne(() => CommentEntity, comment => comment.likes, { nullable: true })
  comment: CommentEntity;

  @CreateDateColumn()
  createdAt: Date;
} 