import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PostEntity } from '../modules/content/entities/post.entity';
import { CommentEntity } from '../modules/content/entities/comment.entity';
import { LikeEntity } from '../modules/content/entities/like.entity';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  mobileNumber: string;

  @OneToMany(() => PostEntity, post => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, comment => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, like => like.user)
  likes: LikeEntity[];

  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some(role => role.name === roleName) ?? false;
  }

  async hasPermission(resource: string, action: string): Promise<boolean> {
    if (!this.roles) return false;
    
    for (const role of this.roles) {
      const hasPermission = role.permissions?.some(
        permission => permission.resource === resource && permission.action === action
      );
      if (hasPermission) return true;
    }
    return false;
  }
} 