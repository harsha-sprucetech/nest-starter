import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  resource: string; // e.g., 'users', 'posts', etc.

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 