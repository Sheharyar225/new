import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (starts from 1)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
