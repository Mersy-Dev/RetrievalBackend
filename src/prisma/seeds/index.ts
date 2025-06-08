// prisma/seed/index.ts
import prisma from "../../config/database";
import { seedDocuments } from "./documents";
// import { seedUsers } from "./user"; // Example, if you have a user.ts

// const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  await seedDocuments();
  // await seedUsers(); // Add more as you build
  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
