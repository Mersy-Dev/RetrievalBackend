import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

// Conectar a la base de datos
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

connectDB();

export default prisma;
