import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import {
  problemStatusEnum,
  problemPriorityEnum,
  attachmentTypeEnum,
  notificationTypeEnum,
  publishingStatusEnum,
  publishingPlatformEnum,
} from './enums';

// ─── Categories ───────────────────────────────────────────────────────────────

export const problemCategories = pgTable('problem_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const problemTypes = pgTable('problem_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => problemCategories.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Problems ─────────────────────────────────────────────────────────────────

export const problems = pgTable('problems', {
  id: uuid('id').primaryKey().defaultRandom(),
  civId: varchar('civ_id', { length: 30 }).notNull().unique(), // CIV-2026-000124
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  categoryId: uuid('category_id').references(() => problemCategories.id, { onDelete: 'set null' }),
  typeId: uuid('type_id').references(() => problemTypes.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: problemStatusEnum('status').notNull().default('submitted'),
  userPriority: problemPriorityEnum('user_priority').notNull().default('medium'),
  aiPriority: problemPriorityEnum('ai_priority'),
  finalPriority: problemPriorityEnum('final_priority'),
  // Computed: used for display
  effectivePriority: problemPriorityEnum('effective_priority').notNull().default('medium'),
  attachmentCount: integer('attachment_count').notNull().default(0),
  isDuplicate: boolean('is_duplicate').notNull().default(false),
  duplicateOfId: uuid('duplicate_of_id'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Locations ────────────────────────────────────────────────────────────────

export const problemLocations = pgTable('problem_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }).unique(),
  city: varchar('city', { length: 100 }).notNull(),
  area: varchar('area', { length: 255 }),
  address: text('address'),
  latitude: varchar('latitude', { length: 30 }),
  longitude: varchar('longitude', { length: 30 }),
  country: varchar('country', { length: 100 }).default('Pakistan'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Attachments ──────────────────────────────────────────────────────────────

export const problemAttachments = pgTable('problem_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  storageUrl: text('storage_url'),
  attachmentType: attachmentTypeEnum('attachment_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Status History ───────────────────────────────────────────────────────────

export const problemStatusHistory = pgTable('problem_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  fromStatus: problemStatusEnum('from_status'),
  toStatus: problemStatusEnum('to_status').notNull(),
  changedById: uuid('changed_by_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── AI Analysis ──────────────────────────────────────────────────────────────

export const aiAnalyses = pgTable('ai_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }).unique(),
  provider: varchar('provider', { length: 50 }).notNull().default('openai'),
  model: varchar('model', { length: 100 }),
  summary: text('summary'),
  severityAssessment: text('severity_assessment'),
  priorityRecommendation: problemPriorityEnum('priority_recommendation'),
  categoryValidation: text('category_validation'),
  evidenceAnalysis: text('evidence_analysis'),
  duplicateFlag: boolean('duplicate_flag').notNull().default(false),
  duplicateConfidence: integer('duplicate_confidence').default(0), // 0-100
  missingInformation: jsonb('missing_information').$type<string[]>(),
  confidenceScore: integer('confidence_score').default(0), // 0-100
  recommendedAction: text('recommended_action'),
  rawResponse: jsonb('raw_response'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Research ─────────────────────────────────────────────────────────────────

export const aiResearchResults = pgTable('ai_research_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }).unique(),
  backgroundInfo: text('background_info'),
  possibleCauses: text('possible_causes'),
  communityImpact: text('community_impact'),
  relevantStatistics: text('relevant_statistics'),
  similarIncidents: text('similar_incidents'),
  potentialSolutions: text('potential_solutions'),
  responsibleAuthority: text('responsible_authority'),
  estimatedResolutionTime: text('estimated_resolution_time'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const researchSources = pgTable('research_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  researchId: uuid('research_id').notNull().references(() => aiResearchResults.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }),
  url: text('url'),
  summary: text('summary'),
  relevanceScore: integer('relevance_score'), // 0-100
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Civic Reports ────────────────────────────────────────────────────────────

export const civicReports = pgTable('civic_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }).unique(),
  overview: text('overview'),
  whyItMatters: text('why_it_matters'),
  researchFindings: text('research_findings'),
  severity: text('severity'),
  recommendedAction: text('recommended_action'),
  responsibleAuthority: text('responsible_authority'),
  proposedPostContent: text('proposed_post_content'),
  hashtags: jsonb('hashtags').$type<string[]>(),
  isAdminEdited: boolean('is_admin_edited').notNull().default(false),
  adminEditedAt: timestamp('admin_edited_at', { withTimezone: true }),
  adminEditedById: uuid('admin_edited_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Admin Reviews ────────────────────────────────────────────────────────────

export const adminReviews = pgTable('admin_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  adminId: uuid('admin_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  notes: text('notes'),
  priorityOverride: problemPriorityEnum('priority_override'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: uuid('problem_id').references(() => problems.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Publishing ───────────────────────────────────────────────────────────────

export const publishingJobs = pgTable('publishing_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  triggeredById: uuid('triggered_by_id').references(() => users.id, { onDelete: 'set null' }),
  platforms: jsonb('platforms').$type<string[]>().notNull(),
  status: publishingStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const publishingResults = pgTable('publishing_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => publishingJobs.id, { onDelete: 'cascade' }),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  platform: publishingPlatformEnum('platform').notNull(),
  status: publishingStatusEnum('status').notNull().default('pending'),
  publishedUrl: text('published_url'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Duplicate Flags ──────────────────────────────────────────────────────────

export const duplicateFlags = pgTable('duplicate_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  potentialDuplicateId: uuid('potential_duplicate_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  confidenceScore: integer('confidence_score').notNull(), // 0-100
  reason: text('reason'),
  resolvedByAdminId: uuid('resolved_by_admin_id').references(() => users.id, { onDelete: 'set null' }),
  resolution: varchar('resolution', { length: 50 }), // 'merged' | 'dismissed'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProblemCategory = typeof problemCategories.$inferSelect;
export type ProblemType = typeof problemTypes.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type ProblemLocation = typeof problemLocations.$inferSelect;
export type ProblemAttachment = typeof problemAttachments.$inferSelect;
export type ProblemStatusHistory = typeof problemStatusHistory.$inferSelect;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type AiResearchResult = typeof aiResearchResults.$inferSelect;
export type ResearchSource = typeof researchSources.$inferSelect;
export type CivicReport = typeof civicReports.$inferSelect;
export type AdminReview = typeof adminReviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type PublishingJob = typeof publishingJobs.$inferSelect;
export type PublishingResult = typeof publishingResults.$inferSelect;
export type DuplicateFlag = typeof duplicateFlags.$inferSelect;
