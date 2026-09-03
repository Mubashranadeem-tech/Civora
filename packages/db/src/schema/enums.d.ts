export declare const userRoleEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["citizen", "admin"]>;
export declare const problemStatusEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["submitted", "under_verification", "ai_analysis", "ai_research", "verified", "rejected", "awaiting_approval", "approved", "publishing", "published", "in_progress", "resolved", "closed", "more_info_needed"]>;
export declare const problemPriorityEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["low", "medium", "high", "critical"]>;
export declare const attachmentTypeEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["image", "document", "other"]>;
export declare const publishingStatusEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["pending", "publishing", "published", "failed", "skipped"]>;
export declare const publishingPlatformEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["linkedin", "facebook", "instagram", "twitter", "wordpress", "webhook"]>;
export declare const notificationTypeEnum: import("node_modules/drizzle-orm/pg-core").PgEnum<["status_change", "ai_complete", "approved", "published", "resolved", "admin_new_problem", "admin_critical", "admin_failed_publish", "info_requested"]>;
