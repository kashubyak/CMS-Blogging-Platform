import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from '../dto/request/create-article.dto';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prismaService: PrismaService) {}
  create(dto: CreateArticleDto): Promise<Article> {
    return this.prismaService.article.create({ data: dto });
  }
}
