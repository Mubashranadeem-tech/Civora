"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    role: (0, enums_1.userRoleEnum)('role').notNull().default('citizen'),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isEmailVerified: (0, pg_core_1.boolean)('is_email_verified').notNull().default(false),
    problemsCount: (0, pg_core_1.integer)('problems_count').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=users.js.map