import { Controller, Get, Param } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import { problemCategories, problemTypes } from '@civora/db';
import { eq, asc } from 'drizzle-orm';

@Controller('categories')
export class CategoriesController {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  @Get()
  async getCategories() {
    return this.db
      .select()
      .from(problemCategories)
      .where(eq(problemCategories.isActive, true))
      .orderBy(asc(problemCategories.sortOrder));
  }

  @Get(':categoryId/types')
  async getTypes(@Param('categoryId') categoryId: string) {
    return this.db
      .select()
      .from(problemTypes)
      .where(eq(problemTypes.categoryId, categoryId))
      .orderBy(asc(problemTypes.sortOrder));
  }
}
