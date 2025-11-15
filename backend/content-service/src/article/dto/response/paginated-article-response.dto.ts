import { ApiProperty } from '@nestjs/swagger';
import { SummaryArticleResponseDto } from './summary-article-response.dto';

export class PaginatedArticleResponseDto {
  @ApiProperty({ type: [SummaryArticleResponseDto] })
  data: SummaryArticleResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
