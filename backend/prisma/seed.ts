import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Every block uses upsert, so running the seed again is always safe.

const roles = ['customer', 'technician', 'admin', 'super_admin'];

// Service names must match the options on the technician registration form
// (web/app/register/technician/page.tsx), because registration looks them up by name.
const catalogue = [
  {
    category: 'Plumbing & Heating',
    services: [
      { name: 'Plumbing', slug: 'plumbing', basePrice: 60, durationInMinutes: 60 },
    ],
  },
  {
    category: 'Electrical',
    services: [
      { name: 'Electrical work', slug: 'electrical-work', basePrice: 70, durationInMinutes: 60 },
    ],
  },
  {
    category: 'Cleaning',
    services: [
      { name: 'Cleaning', slug: 'cleaning', basePrice: 40, durationInMinutes: 120 },
    ],
  },
  {
    category: 'Outdoor',
    services: [
      { name: 'Gardening', slug: 'gardening', basePrice: 35, durationInMinutes: 120 },
    ],
  },
  {
    category: 'Decorating',
    services: [
      { name: 'Painting and decorating', slug: 'painting-and-decorating', basePrice: 150, durationInMinutes: 240 },
    ],
  },
  {
    category: 'General Repairs',
    services: [
      { name: 'Handyman services', slug: 'handyman-services', basePrice: 45, durationInMinutes: 60 },
    ],
  },
];

// City names must match the area options on the technician registration form.
const serviceAreas = [
  { name: 'Cardiff Central', city: 'Cardiff', postalCode: 'CF10', latitude: 51.4816, longitude: -3.1791 },
  { name: 'Bridgend Town', city: 'Bridgend', postalCode: 'CF31', latitude: 51.5043, longitude: -3.5769 },
  { name: 'Swansea Central', city: 'Swansea', postalCode: 'SA1', latitude: 51.6214, longitude: -3.9436 },
  { name: 'Maesteg', city: 'Maesteg', postalCode: 'CF34', latitude: 51.6103, longitude: -3.6567 },
];

/*
 * The default "real admin" (super_admin).
 * Credentials come from the environment, never from code:
 *   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME (optional)
 * If the account already exists it is left untouched (the password is NOT reset).
 */
async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'ValleyFix Admin';

  if (!email || !password) {
    console.log('Super admin: skipped (set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD to create it).');
    return;
  }
  if (password.length < 12) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'super_admin' } });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin: ${email} already exists (left unchanged).`);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      roleId: role.id,
    },
  });
  console.log(`Super admin: created ${email}.`);
}

async function main() {
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Roles: ${roles.length}`);

  let serviceCount = 0;
  for (const [index, group] of catalogue.entries()) {
    const category = await prisma.serviceCategory.upsert({
      where: { name: group.category },
      update: {},
      create: { name: group.category, sortedOrder: index },
    });

    for (const service of group.services) {
      await prisma.service.upsert({
        where: { slug: service.slug },
        update: {},
        create: { ...service, categoryId: category.id },
      });
      serviceCount++;
    }
  }
  console.log(`Service categories: ${catalogue.length}, services: ${serviceCount}`);

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { postalCode: area.postalCode },
      update: {},
      create: { ...area, country: 'United Kingdom' },
    });
  }
  console.log(`Service areas: ${serviceAreas.length}`);

  await seedSuperAdmin();

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
