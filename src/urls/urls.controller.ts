import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  NotFoundException,
  Get,
  Param,
  Res,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/express-request.interface';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('urls')
@ApiBearerAuth()
@Controller()
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // Create short URL
  @UseGuards(JwtAuthGuard)
  @Post('urls')
  async createShortUrl(
    @Body() dto: CreateUrlDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = await this.usersRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.urlsService.create(dto, user);
  }

  // All URLs listing with pagination
  @UseGuards(JwtAuthGuard)
  @Get('urls')
  async getAllUrls(@Query() pagination: PaginationQueryDto) {
    return this.urlsService.getAllUrls(pagination);
  }

  // Logged-in user's own URLs with pagination
  @UseGuards(JwtAuthGuard)
  @Get('urls/my')
  async getMyUrls(
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.urlsService.getUrlsByUserId(req.user.userId, pagination);
  }

  // Search URLs by keyword
  @UseGuards(JwtAuthGuard)
  @Get('urls/search')
  async searchUrls(
    @Query('keyword') keyword: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.urlsService.searchUrlsByKeyword(keyword, pagination);
  }

  // Redirect to original URL
  @Get(':code')
  async redirectToOriginal(
    @Param('code') code: string,
    @Res() res: Response,
  ) {
    const originalUrl = await this.urlsService.handleRedirect(code);
    return res.redirect(302, originalUrl);
  }
}
