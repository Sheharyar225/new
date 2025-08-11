import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ShortUrl } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { User } from '../auth/entities/user.entity';
import * as crypto from 'crypto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);

  constructor(
    @InjectRepository(ShortUrl)
    private readonly urlsRepo: Repository<ShortUrl>,
  ) {}

  private generateRandomCode(length = 6): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
      .toLowerCase();
  }

  async create(dto: CreateUrlDto, user: User) {
    let code = dto.customCode?.trim().toLowerCase();

    if (code) {
      const exists = await this.urlsRepo.findOne({
        where: { shortCode: code },
      });
      if (exists) throw new ConflictException('Custom code already in use');
    } else {
      do {
        code = this.generateRandomCode();
      } while (
        await this.urlsRepo.findOne({ where: { shortCode: code } })
      );
    }

    const shortUrl = `${process.env.BASE_URL}/${code}`;

    const newUrl = this.urlsRepo.create({
      originalUrl: dto.originalUrl,
      shortCode: code,
      shortUrl,
      user,
      clickCount: 0,
    });

    await this.urlsRepo.save(newUrl);
    return { shortCode: code, shortUrl };
  }

  async findByCode(code: string) {
    const url = await this.urlsRepo.findOne({
      where: { shortCode: code.toLowerCase() },
      relations: ['user'],
    });
    if (!url) throw new NotFoundException('Short URL not found');
    return url;
  }

  async getAllUrls({ page = 1, limit = 10 }: PaginationQueryDto) {
    const [data, total] = await this.urlsRepo.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUrlsByUserId(
    userId: number,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ) {
    const [data, total] = await this.urlsRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchUrlsByKeyword(
    keyword: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ) {
    if (!keyword || keyword.trim() === '') {
      return this.getAllUrls({ page, limit });
    }

    const [data, total] = await this.urlsRepo.findAndCount({
      where: [
        { originalUrl: ILike(`%${keyword}%`) },
        { shortCode: ILike(`%${keyword}%`) },
        { shortUrl: ILike(`%${keyword}%`) },
      ],
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async handleRedirect(code: string): Promise<string> {
    const url = await this.urlsRepo.findOne({
      where: { shortCode: code },
    });
    this.logger.log(`Redirect request for code: ${code}`);

    if (!url) {
      throw new NotFoundException(`Short URL not found: ${code}`);
    }

    // Track clicks
    url.clickCount += 1;
    await this.urlsRepo.save(url);

    return url.originalUrl;
  }
}
