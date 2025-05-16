import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { NumberController } from './controllers/number.controller';
import { NumberService } from './services/number.service';
import { NumberEntity } from './entities/number.entity';
import { CarController } from './controllers/car.controller';
import { CarService } from './services/car.service';
import { CarEntity } from './entities/car.entity';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './entities/user.entity';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostEntity } from './entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { LikeEntity } from './entities/like.entity';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([NumberEntity, CarEntity, UserEntity, PostEntity, CommentEntity, LikeEntity]),
    AuthModule,
  ],
  controllers: [NumberController, CarController, AppController, PostController, CommentController],
  providers: [NumberService, CarService, AppService, PostService, CommentService],
})
export class AppModule {}
