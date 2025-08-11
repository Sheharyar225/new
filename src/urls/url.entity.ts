import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Entity('urls')
export class ShortUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({
    unique: true,
    collation: 'utf8_general_ci', //  case-insensitive
  })
  @Index()
  shortCode: string;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ nullable: true })
  shortUrl: string;

  @ManyToOne(() => User, (user) => user.urls, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
