import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../../entities/user.entity';
import { PostEntity } from './post.entity';
import { LikeEntity } from './like.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => UserEntity, user => user.comments)
  author: UserEntity;

  @ManyToOne(() => PostEntity, post => post.comments)
  post: PostEntity;

  @OneToMany(() => LikeEntity, like => like.comment)
  likes: LikeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 