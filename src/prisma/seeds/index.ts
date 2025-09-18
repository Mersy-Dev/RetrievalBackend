import prisma from "../../config/database";
import { seedDocuments } from "./documents";
import { seedAdminUsers } from "./adminuser";
import { seedTranslations } from "./translation"; // ✅ add this

async function main() {
  console.log("🌱 Seeding database...");

  // Seed admin users
  console.log("👤 Seeding admin users...");
  await seedAdminUsers();

  // Seed documents
  console.log("📄 Seeding documents...");
  await seedDocuments();

  // Seed translations
  console.log("🌍 Seeding translations...");
  await seedTranslations();

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

