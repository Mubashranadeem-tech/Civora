import { Controller, Get, Patch, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import { notifications } from '@civora/db';
import { eq, desc, and } from 'drizzle-orm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getUserNotifications(userId: string) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return rows.length;
  }

  async markAllRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return { success: true };
  }

  async markRead(userId: string, notificationId: string) {
    await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    return { success: true };
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.sub);
  }

  @Patch(':id/read')
  async markRead(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(req.user.sub, id);
  }
}

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
