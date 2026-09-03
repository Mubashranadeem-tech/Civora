import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import {
  problems,
  problemCategories,
  problemLocations,
  users,
} from '@civora/db';
import { eq, desc, asc, sql, count } from 'drizzle-orm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getDashboardStats() {
    const [
      totalProblems,
      byStatus,
      byPriority,
      byCategory,
      recentProblems,
      totalUsers,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(problems),
      this.db
        .select({ status: problems.status, count: count() })
        .from(problems)
        .groupBy(problems.status),
      this.db
        .select({ priority: problems.effectivePriority, count: count() })
        .from(problems)
        .groupBy(problems.effectivePriority),
      this.db
        .select({
          categoryName: problemCategories.name,
          count: count(),
          color: problemCategories.color,
        })
        .from(problems)
        .leftJoin(problemCategories, eq(problems.categoryId, problemCategories.id))
        .groupBy(problemCategories.name, problemCategories.color),
      this.db
        .select({
          id: problems.id,
          civId: problems.civId,
          title: problems.title,
          status: problems.status,
          effectivePriority: problems.effectivePriority,
          createdAt: problems.createdAt,
          categoryName: problemCategories.name,
        })
        .from(problems)
        .leftJoin(problemCategories, eq(problems.categoryId, problemCategories.id))
        .orderBy(desc(problems.createdAt))
        .limit(10),
      this.db.select({ count: count() }).from(users).where(eq(users.role, 'citizen')),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, Number(r.count)]));
    const priorityMap = Object.fromEntries(byPriority.map((r) => [r.priority, Number(r.count)]));

    return {
      totalProblems: Number(totalProblems[0]?.count || 0),
      totalUsers: Number(totalUsers[0]?.count || 0),
      byStatus: statusMap,
      byPriority: priorityMap,
      byCategory: byCategory.map((r) => ({
        name: r.categoryName || 'Unknown',
        count: Number(r.count),
        color: r.color,
      })),
      recentProblems,
      // Derived stats
      newProblems: statusMap['submitted'] || 0,
      pendingVerification: (statusMap['under_verification'] || 0) + (statusMap['ai_analysis'] || 0),
      criticalProblems: priorityMap['critical'] || 0,
      verifiedProblems: statusMap['verified'] || 0,
      publishedProblems: statusMap['published'] || 0,
      resolvedProblems: statusMap['resolved'] || 0,
    };
  }
}

@Controller('analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboardStats();
  }
}

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
