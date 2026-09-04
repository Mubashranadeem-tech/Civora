import { Global, Module, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@civora/db';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: (config: ConfigService) => {
        const url =
          config.get<string>('DATABASE_URL') ||
          process.env.DATABASE_URL ||
          'postgresql://civora_user:civora_pass@localhost:5432/civora';
        const client = postgres(url, { max: 10 });
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: any) {}

  async onModuleInit() {
    try {
      // 1. Ensure Admin User Exists with correct password
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civora.ai').toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Civora2026!';
      const hash = await bcrypt.hash(adminPassword, 12);

      const existingAdmin = await this.db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, adminEmail))
        .limit(1);

      if (existingAdmin.length === 0) {
        await this.db.insert(schema.users).values({
          name: process.env.ADMIN_NAME || 'Civora Admin',
          email: adminEmail,
          passwordHash: hash,
          role: 'admin',
          isEmailVerified: true,
        });
        console.log(`✅ Default admin user created: ${adminEmail}`);
      } else {
        await this.db
          .update(schema.users)
          .set({ passwordHash: hash, role: 'admin' })
          .where(eq(schema.users.email, adminEmail));
        console.log(`✅ Admin user credentials verified: ${adminEmail}`);
      }

      // 2. Ensure Categories Exist
      const existingCategories = await this.db
        .select({ id: schema.problemCategories.id })
        .from(schema.problemCategories)
        .limit(1);

      if (existingCategories.length === 0) {
        console.log('🌱 Seeding initial categories into database...');
        const initialCategories = [
          { name: 'Infrastructure', slug: 'infrastructure', icon: 'Building2', color: '#f97316', description: 'Roads, footpaths, bridges' },
          { name: 'Utilities', slug: 'utilities', icon: 'Zap', color: '#eab308', description: 'Electricity, water, gas, sewerage' },
          { name: 'Sanitation & Environment', slug: 'sanitation', icon: 'Leaf', color: '#22c55e', description: 'Waste, trash dumps, cleanliness' },
          { name: 'Education', slug: 'education', icon: 'GraduationCap', color: '#8b5cf6', description: 'Schools, colleges, educational facilities' },
          { name: 'Healthcare', slug: 'healthcare', icon: 'HeartPulse', color: '#ef4444', description: 'Hospitals, dispensaries, healthcare' },
          { name: 'Public Safety', slug: 'safety', icon: 'ShieldAlert', color: '#dc2626', description: 'Hazards, open manholes, safety issues' },
          { name: 'Community Services', slug: 'community-services', icon: 'Users', color: '#ec4899', description: 'Public services and community facilities' },
          { name: 'Other', slug: 'other', icon: 'MoreHorizontal', color: '#6b7280', description: 'General civic problems' },
        ];

        for (let i = 0; i < initialCategories.length; i++) {
          const c = initialCategories[i];
          await this.db.insert(schema.problemCategories).values({
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            color: c.color,
            description: c.description,
            sortOrder: i + 1,
          });
        }
        console.log('✅ Initial categories seeded successfully');
      }
    } catch (err) {
      console.warn('⚠️ Auto-seed notice (continuing):', err);
    }
  }
}
