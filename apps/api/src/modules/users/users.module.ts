import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import { users } from '@civora/db';
import { eq, desc, count } from 'drizzle-orm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Module } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  @Get()
  async getUsers() {
    return this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        city: users.city,
        problemsCount: users.problemsCount,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }
}

@Module({
  controllers: [UsersController],
})
export class UsersModule {}
