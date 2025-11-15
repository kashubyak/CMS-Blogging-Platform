import { ApiProperty } from '@nestjs/swagger';
import { ArticleDto } from './summary-article-response.dto';

export class PaginatedArticleResponseDto {
  @ApiProperty({ type: [ArticleDto] })
  data: ArticleDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
