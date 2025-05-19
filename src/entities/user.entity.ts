import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
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

  @Column({ unique: true, nullable: true })
  mobileNumber: string;

  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PostEntity, post => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, comment => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, like => like.user)
  postLikes: LikeEntity[];

  @OneToMany(() => LikeEntity, like => like.user)
  commentLikes: LikeEntity[];

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