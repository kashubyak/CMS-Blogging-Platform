import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { articleSlugKey } from 'src/common/redis.const';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { FilterArticleDto } from './dto/request/filter-article.dto';
import { PaginatedArticleResponseDto } from './dto/response/paginated-article-response.dto';
import { ArticleRepository } from './repository/article.repository';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const cacheKey = articleSlugKey(slug);
    const cachedArticle = await this.cacheManager.get<Article>(cacheKey);

    if (cachedArticle) {
      console.log(`🎯 Cache HIT: ${slug}`);
      return cachedArticle;
    }

    console.log(`💾 Cache MISS: ${slug}`);
    const article = await this.articleRepository.findOneSlug(slug);

    if (!article)
      throw new NotFoundException(`Article with slug ${slug} not found`);

    await this.cacheManager.set(cacheKey, article);

    return article;
  }
}
