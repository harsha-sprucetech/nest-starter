import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../../entities/user.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @ManyToOne(() => UserEntity, user => user.posts)
  author: UserEntity;

  @OneToMany(() => CommentEntity, comment => comment.post)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, like => like.post)
  likes: LikeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 