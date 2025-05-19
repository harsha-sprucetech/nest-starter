import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserEntity } from '../../entities/user.entity';
import { RoleEntity } from '../../entities/role.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { AdminRoleController } from './controllers/admin-role.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminPermissionController } from './controllers/admin-permission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController, RoleController, AdminRoleController, AdminPermissionController],
  providers: [AuthService, RoleService, JwtStrategy],
  exports: [AuthService, RoleService],
})
export class AuthModule {} 