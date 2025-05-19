import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../entities/user.entity';
import { RoleEntity } from '../../../entities/role.entity';
import { PermissionEntity } from '../../../entities/permission.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: { email: string; password: string; name: string }) {
    const { password, ...userData } = registerDto;
    
    // Find or create the user role
    let userRole = await this.roleRepository.findOne({ 
      where: { name: 'user' },
      relations: ['permissions']
    });

    if (!userRole) {
      userRole = await this.roleRepository.save({
        name: 'user',
        description: 'Regular user role'
      });
    }
    
    // Create user - password will be hashed by @BeforeInsert() hook
    const user = this.userRepository.create({
      ...userData,
      password, // Pass the plain password, it will be hashed by the entity hook
      roles: [userRole]
    });
    
    await this.userRepository.save(user);
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['roles', 'roles.permissions']
    });
    
    if (user && await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    };
  }
} 