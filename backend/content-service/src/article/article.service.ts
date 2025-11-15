import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { ArticleRepository } from './repository/article.repository';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}
  async createArticle(dto: CreateArticleDto) {
    return this.articleRepository.create(dto);
  }
}
