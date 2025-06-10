// prisma/seed/adminuser.ts
import prisma from "../../config/database";
import bcrypt from "bcrypt";

export const seedAdminUsers = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10); // Replace with a strong default password or load from env

  await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      refreshToken: null,
      isEmailVerified: true, // Optional: Mark seeded admin as verified
      createdAt: new Date(), // Optional: Could omit this as Prisma sets it by default
    },
  });

  await prisma.admin.upsert({
    where: { email: "support@example.com" },
    update: {},
    create: {
      name: "Support Admin",
      email: "support@example.com",
      password: hashedPassword,
      refreshToken: null,
      isEmailVerified: true,
      createdAt: new Date(),
    },
  });

  console.log("✅ Admin users seeded.");
};
