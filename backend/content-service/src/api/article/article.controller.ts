import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { FilterArticleDto } from './dto/request/filter-article.dto';
import { UpdateArticleDto } from './dto/request/update-article.dto';
import { PaginatedArticleResponseDto } from './dto/response/paginated-article-response.dto';
import { ArticleDto } from './dto/response/summary-article-response.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({
    description: 'The article has been successfully created.',
    type: ArticleDto,
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

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get article by slug (Cached)' })
  @ApiOkResponse({
    description: 'The article has been successfully retrieved.',
    type: ArticleDto,
  })
  getOneArticle(@Param('slug') slug: string) {
    return this.articleService.getArticleBySlug(slug);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update article by id' })
  @ApiOkResponse({
    description: 'The article has been successfully updated.',
    type: ArticleDto,
  })
  updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(id, dto);
  }
}
