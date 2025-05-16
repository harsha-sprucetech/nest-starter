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
    TypeOrmModule.forFeature([NumberEntity, CarEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [NumberController, CarController],
  providers: [NumberService, CarService],
})
export class AppModule {}
