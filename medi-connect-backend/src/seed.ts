import { prisma } from './config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');

  // Create test doctors
  const hashedPassword = await bcrypt.hash('password123', 10);

  const doctor1 = await prisma.user.upsert({
    where: { email: 'doctor1@test.com' },
    update: {},
    create: {
      name: 'Dr. John Smith',
      email: 'doctor1@test.com',
      password: hashedPassword,
      role: 'DOCTOR',
      specialization: 'Cardiologist',
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@test.com' },
    update: {},
    create: {
      name: 'Dr. Jane Doe',
      email: 'doctor2@test.com',
      password: hashedPassword,
      role: 'DOCTOR',
      specialization: 'Neurologist',
    },
  });

  // Create test patient
  const patient = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      name: 'John Patient',
      email: 'patient@test.com',
      password: hashedPassword,
      role: 'PATIENT',
    },
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
