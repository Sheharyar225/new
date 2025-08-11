import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://example.com/some/long/url',
    description: 'The original full URL that you want to shorten',
  })
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @ApiProperty({
    example: 'my-custom-code',
    description: 'Optional custom short code (4-20 characters, letters, numbers, - or _)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]{4,20}$/, {
    message: 'customCode must be 4-20 chars long, letters/numbers/-/_ only',
  })
  customCode?: string;
}
