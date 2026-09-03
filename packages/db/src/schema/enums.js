"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationTypeEnum = exports.publishingPlatformEnum = exports.publishingStatusEnum = exports.attachmentTypeEnum = exports.problemPriorityEnum = exports.problemStatusEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['citizen', 'admin']);
exports.problemStatusEnum = (0, pg_core_1.pgEnum)('problem_status', [
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
exports.problemPriorityEnum = (0, pg_core_1.pgEnum)('problem_priority', [
    'low',
    'medium',
    'high',
    'critical',
]);
exports.attachmentTypeEnum = (0, pg_core_1.pgEnum)('attachment_type', [
    'image',
    'document',
    'other',
]);
exports.publishingStatusEnum = (0, pg_core_1.pgEnum)('publishing_status', [
    'pending',
    'publishing',
    'published',
    'failed',
    'skipped',
]);
exports.publishingPlatformEnum = (0, pg_core_1.pgEnum)('publishing_platform', [
    'linkedin',
    'facebook',
    'instagram',
    'twitter',
    'wordpress',
    'webhook',
]);
exports.notificationTypeEnum = (0, pg_core_1.pgEnum)('notification_type', [
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
//# sourceMappingURL=enums.js.map