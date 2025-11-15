import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { CreateArticleResponseDto } from './dto/response/create-article-response.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({
    description: 'The article has been successfully created.',
    type: CreateArticleResponseDto,
  })
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articleService.createArticle(dto);
  }
}
