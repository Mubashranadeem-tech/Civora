import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { users, problemCategories, problemTypes } from './schema';

const CATEGORIES_SEED = [
  {
    name: 'Infrastructure',
    slug: 'infrastructure',
    description: 'Roads, bridges, buildings, and public physical infrastructure',
    icon: 'Building2',
    color: '#f97316',
    sortOrder: 1,
    types: [
      { name: 'Pothole', slug: 'pothole' },
      { name: 'Broken Road', slug: 'broken-road' },
      { name: 'Road Collapse', slug: 'road-collapse' },
      { name: 'Damaged Footpath', slug: 'damaged-footpath' },
      { name: 'Bridge Damage', slug: 'bridge-damage' },
      { name: 'Missing Road Sign', slug: 'missing-road-sign' },
      { name: 'Damaged Public Building', slug: 'damaged-public-building' },
      { name: 'Other', slug: 'other-infrastructure' },
    ],
  },
  {
    name: 'Utilities',
    slug: 'utilities',
    description: 'Electricity, water, gas, drainage, and essential utility services',
    icon: 'Zap',
    color: '#eab308',
    sortOrder: 2,
    types: [
      { name: 'Power Outage', slug: 'power-outage' },
      { name: 'Street Light Not Working', slug: 'street-light-not-working' },
      { name: 'Broken Street Light Pole', slug: 'broken-street-light-pole' },
      { name: 'Water Supply Disruption', slug: 'water-supply-disruption' },
      { name: 'Water Leakage', slug: 'water-leakage' },
      { name: 'Gas Leakage', slug: 'gas-leakage' },
      { name: 'Drainage Blockage', slug: 'drainage-blockage' },
      { name: 'Sewerage Overflow', slug: 'sewerage-overflow' },
      { name: 'Other', slug: 'other-utilities' },
    ],
  },
  {
    name: 'Sanitation & Environment',
    slug: 'sanitation',
    description: 'Waste management, cleanliness, pollution, and green spaces',
    icon: 'Leaf',
    color: '#22c55e',
    sortOrder: 3,
    types: [
      { name: 'Illegal Garbage Dump', slug: 'illegal-garbage-dump' },
      { name: 'Overflowing Bin', slug: 'overflowing-bin' },
      { name: 'Irregular Waste Collection', slug: 'irregular-waste-collection' },
      { name: 'Illegal Dumping', slug: 'illegal-dumping' },
      { name: 'Air Pollution', slug: 'air-pollution' },
      { name: 'Water Pollution', slug: 'water-pollution' },
      { name: 'Damaged Park', slug: 'damaged-park' },
      { name: 'Illegal Tree Cutting', slug: 'illegal-tree-cutting' },
      { name: 'Sewage in Open Area', slug: 'sewage-open-area' },
      { name: 'Other', slug: 'other-sanitation' },
    ],
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Schools, colleges, educational facilities, and learning infrastructure',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    sortOrder: 4,
    types: [
      { name: 'School Infrastructure Problem', slug: 'school-infrastructure' },
      { name: 'Missing Facilities', slug: 'missing-educational-facilities' },
      { name: 'Lack of Teaching Staff', slug: 'lack-teaching-staff' },
      { name: 'Dangerous School Environment', slug: 'dangerous-school-environment' },
      { name: 'College Problem', slug: 'college-problem' },
      { name: 'Other', slug: 'other-education' },
    ],
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Hospitals, clinics, emergency services, and medical facilities',
    icon: 'HeartPulse',
    color: '#ef4444',
    sortOrder: 5,
    types: [
      { name: 'Hospital Facility Problem', slug: 'hospital-facility' },
      { name: 'Medicine Shortage', slug: 'medicine-shortage' },
      { name: 'Missing Medical Equipment', slug: 'missing-medical-equipment' },
      { name: 'Clinic Closure', slug: 'clinic-closure' },
      { name: 'Emergency Services Failure', slug: 'emergency-services-failure' },
      { name: 'Other', slug: 'other-healthcare' },
    ],
  },
  {
    name: 'Transportation',
    slug: 'transportation',
    description: 'Traffic, public transport, parking, signals, and road safety',
    icon: 'Car',
    color: '#06b6d4',
    sortOrder: 6,
    types: [
      { name: 'Traffic Congestion', slug: 'traffic-congestion' },
      { name: 'Broken Traffic Signal', slug: 'broken-traffic-signal' },
      { name: 'Missing Road Markings', slug: 'missing-road-markings' },
      { name: 'Public Transport Failure', slug: 'public-transport-failure' },
      { name: 'Illegal Parking', slug: 'illegal-parking' },
      { name: 'Dangerous Junction', slug: 'dangerous-junction' },
      { name: 'Other', slug: 'other-transportation' },
    ],
  },
  {
    name: 'Public Safety',
    slug: 'public-safety',
    description: 'Dangerous locations, open manholes, broken safety infrastructure, and public hazards',
    icon: 'ShieldAlert',
    color: '#dc2626',
    sortOrder: 7,
    types: [
      { name: 'Open Manhole', slug: 'open-manhole' },
      { name: 'Dangerous Electrical Wire', slug: 'dangerous-electrical-wire' },
      { name: 'Collapsed Wall/Structure', slug: 'collapsed-structure' },
      { name: 'Missing Safety Signs', slug: 'missing-safety-signs' },
      { name: 'Public Hazard', slug: 'public-hazard' },
      { name: 'Other', slug: 'other-public-safety' },
    ],
  },
  {
    name: 'Community Services',
    slug: 'community-services',
    description: 'Public offices, municipal services, and community facilities',
    icon: 'Users',
    color: '#ec4899',
    sortOrder: 8,
    types: [
      { name: 'Poor Government Office Service', slug: 'poor-government-service' },
      { name: 'Missing Public Facility', slug: 'missing-public-facility' },
      { name: 'Corruption/Negligence', slug: 'corruption-negligence' },
      { name: 'Delayed Municipal Service', slug: 'delayed-municipal-service' },
      { name: 'Other', slug: 'other-community-services' },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Any civic problem not covered in the above categories',
    icon: 'MoreHorizontal',
    color: '#6b7280',
    sortOrder: 9,
    types: [
      { name: 'General Civic Problem', slug: 'general-civic-problem' },
    ],
  },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not defined');

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema: { users, problemCategories, problemTypes } });

  console.log('🌱 Seeding Civora database...');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civora.ai';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Civora2026!';
  const adminName = process.env.ADMIN_NAME || 'Civora Admin';

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }

  // ─── Categories & Types ──────────────────────────────────────────────────────
  for (const cat of CATEGORIES_SEED) {
    const existing = await db
      .select({ id: problemCategories.id })
      .from(problemCategories)
      .where(eq(problemCategories.slug, cat.slug))
      .limit(1);

    let categoryId: string;
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(problemCategories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
        })
        .returning({ id: problemCategories.id });
      categoryId = inserted.id;
      console.log(`✅ Category created: ${cat.name}`);
    } else {
      categoryId = existing[0].id;
      console.log(`⏭️  Category exists: ${cat.name}`);
    }

    // Problem Types
    for (let i = 0; i < cat.types.length; i++) {
      const t = cat.types[i];
      const existingType = await db
        .select({ id: problemTypes.id })
        .from(problemTypes)
        .where(eq(problemTypes.slug, t.slug))
        .limit(1);

      if (existingType.length === 0) {
        await db.insert(problemTypes).values({
          categoryId,
          name: t.name,
          slug: t.slug,
          sortOrder: i,
        });
      }
    }
  }

  console.log('✅ Civora database seeded successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
