// import { PrismaClient } from '@prisma/client';
import prisma from "../../config/database";

import enJson from "./en.json";
import yoJson from "./yo.json";

// const prisma = new PrismaClient();

//helper to flatten nested JSON into dot.notation keys
function flattenJSON(obj: any, prefix = ""): Record<string, string> {
  let result: Record<string, string> = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenJSON(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export async function seedTranslations() {
  console.log("🌍 Seeding translations...");

  const enFlat = flattenJSON(enJson);
  const yoFlat = flattenJSON(yoJson);

  // ✅ seed English
  for (const [key, value] of Object.entries(enFlat)) {
    await prisma.translation.upsert({
      where: { key_locale: { key, locale: "en" } },
      update: { value },
      create: { key, locale: "en", value },
    });
  }

  // ✅ seed Yoruba (fallback to English if missing)
  for (const [key, value] of Object.entries(enFlat)) {
  await prisma.translation.upsert({
    where: { key_locale: { key, locale: "yo" } },
    update: { value: yoFlat[key] ?? "" }, // empty string if missing
    create: { key, locale: "yo", value: yoFlat[key] ?? "" },
  });
}

  console.log("✅ Translations seeded successfully");
}
