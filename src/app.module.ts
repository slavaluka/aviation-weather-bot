import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { WeatherService } from './weather/weather.service';
import { WeatherUpdate } from './weather/weather.update';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [WeatherService, WeatherUpdate, RateLimiterService],
})
export class AppModule {}
