import { Injectable } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from '../dto/request/create-article.dto';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateArticleDto): Promise<Article> {
    return this.prisma.article.create({ data: dto });
  }

  async getAll(args: {
    where: Prisma.ArticleWhereInput;
    orderBy: Prisma.ArticleOrderByWithRelationInput;
    skip: number;
    take: number;
  }): Promise<{ data: Article[]; total: number }> {
    const { where, orderBy, skip, take } = args;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        // include: { author: true },
        skip,
        take,
        orderBy,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data, total };
  }
}
