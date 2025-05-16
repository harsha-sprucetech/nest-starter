import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';
import { LikeEntity } from './like.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  postId: number;

  @Column()
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => PostEntity, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @OneToMany(() => LikeEntity, like => like.comment)
  likes: LikeEntity[];
} 