import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Article, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { articleSlugKey } from 'src/common/redis.constant';
import { SearchService } from '../search/search.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { FilterArticleDto } from './dto/request/filter-article.dto';
import { PaginatedArticleResponseDto } from './dto/response/paginated-article-response.dto';
import { ArticleDto } from './dto/response/summary-article-response.dto';
import { ArticleRepository } from './repository/article.repository';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly searchService: SearchService,
  ) {}

  async createArticle(dto: CreateArticleDto) {
    const article = await this.articleRepository.create(dto);
    const cacheKey = articleSlugKey(article.slug);
    await this.cacheManager.set(cacheKey, article);
    await this.searchService.indexArticle(article);
    return article;
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

    if (search) {
      const { results, total } = await this.searchService.search(
        search,
        page,
        limit,
      );

      return {
        data: results as unknown as ArticleDto[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const where: Prisma.ArticleWhereInput = {};
    const skip = (page - 1) * limit;

    const { data, total } = await this.articleRepository.getAll({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    });

    return {
      data: data as unknown as ArticleDto[],
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

  async updateArticle(id: number, dto: Partial<CreateArticleDto>) {
    const updatedArticle = await this.articleRepository.update(id, dto);
    const cacheKey = articleSlugKey(updatedArticle.slug);
    console.log(`🧹 Cache CLEAR: ${cacheKey}`);
    await this.cacheManager.del(cacheKey);
    await this.searchService.updateArticle(updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number) {
    const deletedArticle = await this.articleRepository.delete(id);
    const cacheKey = articleSlugKey(deletedArticle.slug);
    console.log(`🧹 Cache CLEAR: ${cacheKey}`);
    await this.cacheManager.del(cacheKey);
    await this.searchService.removeArticle(id);
    return { message: 'Article deleted successfully' };
  }
}
