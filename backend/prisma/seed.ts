import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding Prisma MySQL database with Tribal Scholar data...');

  const studentPasswordHash = bcrypt.hashSync('Student@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  // 1. Create Users
  const studentUser = await prisma.user.upsert({
    where: { otrId: 'OTR2026001234' },
    update: {},
    create: {
      id: 'usr_student_1',
      email: 'aarav.kumar@demo.tribalscholar.in',
      mobile: '9876543210',
      passwordHash: studentPasswordHash,
      role: 'student',
      otrId: 'OTR2026001234',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tribalscholar.demo' },
    update: {},
    create: {
      id: 'usr_admin_1',
      email: 'admin@tribalscholar.demo',
      mobile: '9900112233',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  // 2. Create Student Profile
  await prisma.student.upsert({
    where: { otrId: 'OTR2026001234' },
    update: {},
    create: {
      id: 'std_1',
      userId: studentUser.id,
      otrId: 'OTR2026001234',
      fullName: 'Aarav Kumar',
      dob: '2004-05-14',
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Salem',
      pincode: '636001',
      address: 'Door 45, Tribal Welfare Colony, Yercaud Road, Salem',
      category: 'ST (Scheduled Tribe)',
      stCertificateNo: 'ST/TN/2023/88912',
      pvtgStatus: 0,
      annualIncome: 185000,
      fatherName: 'Kannan Kumar',
      motherName: 'Lakshmi Kumar',
      academicLevel: 'Post-Matric',
      currentCourse: 'B.Sc Computer Science (2nd Year)',
      institutionName: 'Government Arts College, Salem',
      institutionCode: 'AISHE-C-23491',
      bankAccountNo: '9182736450192',
      ifscCode: 'SBIN0004521',
      bankName: 'State Bank of India',
      aadhaarMasked: 'XXXX-XXXX-8912',
    },
  });

  console.log('Prisma database seeded successfully.');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
