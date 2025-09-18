// server/controllers/translationController.ts
import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

export const getTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check both path param and query param
    let lang = req.params.lang || req.query.lang || "en";

    if (Array.isArray(lang)) {
      lang = lang[0];
    }

    const translations = await prisma.translation.findMany({
      where: { locale: String(lang) },
      select: { key: true, value: true },
    });

    const response = translations.reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as Record<string, string>);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ error: "Failed to fetch translations" });
  }
};

/**
 * Create (or Upsert) a new translation
 */
export const createTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, locale } = req.body;

    if (!key || !value || !locale) {
      res.status(400).json({ error: "key, value, and locale are required" });
      return;
    }

    // ✅ Upsert ensures no duplicate errors
    const newTranslation = await prisma.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value },
      create: { key, locale, value },
    });

    res.status(201).json(newTranslation);
  } catch (error) {
    console.error("❌ Error creating translation:", error);
    res.status(500).json({ error: "Failed to create translation" });
  }
};

/**
 * Update a translation by key + locale
 */
export const updateTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, locale, value } = req.body;

    if (!key || !locale) {
      res.status(400).json({ error: "key and locale are required" });
      return;
    }

    const updated = await prisma.translation.update({
      where: { key_locale: { key, locale } },
      data: { value },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error updating translation:", error);
    res.status(500).json({ error: "Failed to update translation" });
  }
};

/**
 * Delete a translation by key + locale
 */
export const deleteTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, locale } = req.body; // or req.params if you want

    if (!key || !locale) {
      res.status(400).json({ error: "key and locale are required" });
      return;
    }

    await prisma.translation.delete({
      where: { key_locale: { key, locale } },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error("❌ Error deleting translation:", error);
    res.status(500).json({ error: "Failed to delete translation" });
  }
};
