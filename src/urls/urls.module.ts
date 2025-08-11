import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { ShortUrl } from './url.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl, User])],
  controllers: [UrlsController],
  providers: [UrlsService],
  exports: [UrlsService],
})
export class UrlsModule {}
