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

  async search(text: string, page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const response = await this.elasticsearchService.search({
      index: this.index,
      from,
      size: limit,
      track_total_hits: true,
      query: {
        multi_match: {
          query: text,
          fields: ['title^3', 'content'],
          fuzziness: 'AUTO',
        },
      },
    });

    const hits = response.hits.hits;
    const total = (response.hits.total as { value: number }).value;
    return {
      result: hits.map((hit) => hit._source),
      total,
    };
  }

  updateArticle(article: Article) {
    return this.indexArticle(article);
  }

  async removeArticle(articleId: number) {
    await this.elasticsearchService.delete({
      index: this.index,
      id: articleId.toString(),
    });
  }
}
