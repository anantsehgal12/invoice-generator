import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = process.env.DEV_USER_ID || process.env.NEXT_PUBLIC_DEV_USER_ID || 'dev-user-123';

  // Seed a minimal company
  await prisma.company.upsert({
    where: { id: 'seed-co-1' },
    update: {},
    create: {
      id: 'seed-co-1',
      userId,
      name: 'Acme Pvt Ltd',
      logo: null,
      gst: '27ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      mobile: '9876543210',
      email: 'accounts@acmepvtltd.example',
      website: 'https://acmepvtltd.example',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Acme Pvt Ltd',
    },
  });

  // Seed a minimal product
  await prisma.product.upsert({
    where: { id: 'seed-prod-1' },
    update: {},
    create: {
      id: 'seed-prod-1',
      userId,
      name: 'Standard Service',
      description: 'Consulting service',
      hsnCode: '998313',
      price: 1000,
      taxRate: 18,
      unit: 'hour',
      category: 'Services',
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
