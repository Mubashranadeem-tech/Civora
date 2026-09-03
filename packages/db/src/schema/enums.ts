import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['citizen', 'admin']);

export const problemStatusEnum = pgEnum('problem_status', [
  'submitted',
  'under_verification',
  'ai_analysis',
  'ai_research',
  'verified',
  'rejected',
  'awaiting_approval',
  'approved',
  'publishing',
  'published',
  'in_progress',
  'resolved',
  'closed',
  'more_info_needed',
]);

export const problemPriorityEnum = pgEnum('problem_priority', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const attachmentTypeEnum = pgEnum('attachment_type', [
  'image',
  'document',
  'other',
]);

export const publishingStatusEnum = pgEnum('publishing_status', [
  'pending',
  'publishing',
  'published',
  'failed',
  'skipped',
]);

export const publishingPlatformEnum = pgEnum('publishing_platform', [
  'linkedin',
  'facebook',
  'instagram',
  'twitter',
  'wordpress',
  'webhook',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'status_change',
  'ai_complete',
  'approved',
  'published',
  'resolved',
  'admin_new_problem',
  'admin_critical',
  'admin_failed_publish',
  'info_requested',
]);
