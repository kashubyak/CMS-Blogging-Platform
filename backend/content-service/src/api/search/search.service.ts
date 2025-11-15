import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Article } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly index = 'articles';
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexArticle(article: Article) {
    return this.elasticsearchService.index({
      index: this.index,
      id: article.id.toString(),
      document: {
        id: article.id,
        title: article.title,
        content: article.content,
        slug: article.slug,
        authorId: article.authorId,
        createdAt: article.createdAt,
      },
    });
  }
}
