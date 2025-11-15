import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { PrismaModule } from 'prisma/prisma.module';
import { ArticleModule } from './src/article/article.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 300,
    }),
    PrismaModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
