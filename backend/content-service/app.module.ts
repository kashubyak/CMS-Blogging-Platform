import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as redisStore from 'cache-manager-ioredis';
import { PrismaModule } from 'prisma/prisma.module';
import { ArticleModule } from './src/api/article/article.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'content-service',
            brokers: ['localhost:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
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
