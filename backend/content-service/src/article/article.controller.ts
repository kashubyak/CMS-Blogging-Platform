import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { FilterArticleDto } from './dto/request/filter-article.dto';
import { PaginatedArticleResponseDto } from './dto/response/paginated-article-response.dto';
import { SummaryArticleResponseDto } from './dto/response/summary-article-response.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({
    description: 'The article has been successfully created.',
    type: SummaryArticleResponseDto,
  })
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articleService.createArticle(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all articles' })
  @ApiCreatedResponse({
    description: 'The articles have been successfully retrieved.',
    type: PaginatedArticleResponseDto,
  })
  getAllArticles(@Query() query: FilterArticleDto) {
    return this.articleService.getAllArticles(query);
  }
}
