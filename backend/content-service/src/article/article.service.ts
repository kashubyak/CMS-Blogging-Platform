import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { FilterArticleDto } from './dto/request/filter-article.dto';
import { PaginatedArticleResponseDto } from './dto/response/paginated-article-response.dto';
import { ArticleRepository } from './repository/article.repository';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async createArticle(dto: CreateArticleDto) {
    return this.articleRepository.create(dto);
  }

  async getAllArticles(
    query: FilterArticleDto,
  ): Promise<PaginatedArticleResponseDto> {
    const {
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.ArticleWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const { data, total } = await this.articleRepository.getAll({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
