// server/controllers/translationController.ts
import { PrismaClient } from "../generated/client";
import { Request, Response } from "express";
import axios from "axios";
import pdfParse from "pdf-parse";
import path from "path";
import PDFDocument from "pdfkit";
import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = true;
env.allowRemoteModels = true;
// Set Hugging Face token via environment variable, not env object
process.env.HF_TOKEN = process.env.HF_TOKEN;

const prisma = new PrismaClient();

declare module "@xenova/transformers" {
  interface TranslationOptions {
    src_lang?: string;
    tgt_lang?: string;
  }
}

export const documentTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let { lang = "yo", download = "false" } = req.query;

    if (Array.isArray(lang)) lang = lang[0];
    if (Array.isArray(download)) download = download[0];

    // 1️⃣ Get document record
    const doc = await prisma.document.findUnique({
      where: { id: Number(id) },
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    if (!doc.signedUrl) {
      res.status(400).json({ error: "Document file not available" });
      return;
    }

    // 2️⃣ Check cache
    let translation = await prisma.translationCache.findFirst({
      where: { documentId: Number(id), language: String(lang) },
    });

    if (!translation) {
      console.log("📄 Downloading file from Appwrite...");
      const response = await axios.get(doc.signedUrl, {
        responseType: "arraybuffer",
      });
      const pdfBuffer = Buffer.from(response.data, "binary");

      console.log("📘 Extracting text from PDF...");
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;

      console.log("🌍 Translating with Hugging Face model...");
      const modelName = "Xenova/nllb-200-distilled-600M"; // fallback example: English → French

      const translator = await pipeline("translation", modelName);
      const result = await translator(
        extractedText,
        {
          src_lang: "eng_Latn",
          tgt_lang: lang === "yo" ? "yor_Latn" : "fra_Latn", // Yoruba or French
        } as any // Cast to any to bypass type error
      );

      const translatedText = Array.isArray(result)
        ? result.map((r: any) => r.translation_text).join(" ")
        : (result as any).translation_text;

      // 💾 Cache translation
      translation = await prisma.translationCache.create({
        data: {
          documentId: Number(id),
          language: String(lang),
          translated: translatedText,
        },
      });
    }

    // 3️⃣ Return translated PDF if requested
    if (download === "true") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=translated-${id}-${lang}.pdf`
      );

      const pdfDoc = new PDFDocument();

      // ✅ Register Yoruba-compatible font
      const fontPath = path.join(
        __dirname,
        "../../assets/fonts/static/NotoSans-Regular.ttf"
      );
      pdfDoc.registerFont("NotoSans", fontPath);

      // 📝 Use the Unicode font
      pdfDoc.pipe(res);
      pdfDoc.font("NotoSans").fontSize(12).text(translation.translated, {
        align: "left",
      });
      pdfDoc.end();
      return;
    }

    // 4️⃣ Return translation as JSON
    res.status(200).json({
      id: doc.id,
      title: doc.title,
      language: lang,
      translation: translation.translated,
    });
  } catch (error) {
    console.error("❌ Error translating document:", error);
    res.status(500).json({ error: "Failed to translate document" });
  }
};

export const getTranslations = async (
  req: Request,
  res: Response
): Promise<void> => {
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
export const createTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
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
export const updateTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
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
export const deleteTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
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
