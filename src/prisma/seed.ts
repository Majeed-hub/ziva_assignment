import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      name: 'Library Admin',
      email: 'admin@library.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });

  // Create regular users
  const userPassword = await bcrypt.hash('user123', 12);
  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'USER',
      phone: '+1234567891',
    },
  });

  await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'USER',
      phone: '+1234567892',
    },
  });

  // Create authors
  const author1 = await prisma.author.upsert({
    where: { email: 'jkrowling@example.com' },
    update: {},
    create: {
      name: 'J.K. Rowling',
      email: 'jkrowling@example.com',
      bio: 'British author, best known for the Harry Potter series.',
    },
  });

  const author2 = await prisma.author.upsert({
    where: { email: 'tolkien@example.com' },
    update: {},
    create: {
      name: 'J.R.R. Tolkien',
      email: 'tolkien@example.com',
      bio: 'English writer and philologist, author of The Lord of the Rings.',
    },
  });

  const author3 = await prisma.author.upsert({
    where: { email: 'orwell@example.com' },
    update: {},
    create: {
      name: 'George Orwell',
      email: 'orwell@example.com',
      bio: 'English novelist and essayist, known for 1984 and Animal Farm.',
    },
  });

  // Create books
  const book1 = await prisma.book.upsert({
    where: { isbn: '9780439708180' },
    update: {},
    create: {
      title: 'Harry Potter and the Sorcerer\'s Stone',
      isbn: '9780439708180',
      publicationYear: 1997,
      totalCopies: 5,
      availableCopies: 5,
      authorId: author1.id,
    },
  });

  const book2 = await prisma.book.upsert({
    where: { isbn: '9780547928227' },
    update: {},
    create: {
      title: 'The Hobbit',
      isbn: '9780547928227',
      publicationYear: 1937,
      totalCopies: 3,
      availableCopies: 3,
      authorId: author2.id,
    },
  });

  const book3 = await prisma.book.upsert({
    where: { isbn: '9780452284234' },
    update: {},
    create: {
      title: '1984',
      isbn: '9780452284234',
      publicationYear: 1949,
      totalCopies: 4,
      availableCopies: 4,
      authorId: author3.id,
    },
  });

  const book4 = await prisma.book.upsert({
    where: { isbn: '9780439139601' },
    update: {},
    create: {
      title: 'Harry Potter and the Chamber of Secrets',
      isbn: '9780439139601',
      publicationYear: 1998,
      totalCopies: 3,
      availableCopies: 3,
      authorId: author1.id,
    },
  });

  // Create book copies
  const books = [book1, book2, book3, book4];
  for (const book of books) {
    for (let i = 0; i < book.totalCopies; i++) {
      await prisma.bookCopy.create({
        data: {
          bookId: book.id,
          condition: i === 0 ? 'EXCELLENT' : i === 1 ? 'GOOD' : 'FAIR',
        },
      });
    }
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log(`👤 Users: 3 (1 admin, 2 regular users)`);
  console.log(`✍️  Authors: 3`);
  console.log(`📚 Books: 4`);
  console.log(`📖 Book Copies: ${books.reduce((sum, book) => sum + book.totalCopies, 0)}`);
  console.log('\n🔐 Login Credentials:');
  console.log('Admin: admin@library.com / admin123');
  console.log('User 1: john@example.com / user123');
  console.log('User 2: jane@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });