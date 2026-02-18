// server/controllers/translationController.ts
import { PrismaClient } from '@prisma/client'
import { Request, Response } from "express";
import axios from "axios";
import pdfParse from "pdf-parse";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import { TranslationServiceClient } from "@google-cloud/translate";
import { Client, Storage } from "node-appwrite";

// Use a Node.js read stream for uploads instead of importing DOM/File to avoid type mismatches
const prisma = new PrismaClient();
const translationClient = new TranslationServiceClient();

// 🔹 Appwrite setup
const appwrite = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
  .setProject(process.env.APPWRITE_PROJECT_ID as string)
  .setKey(process.env.APPWRITE_API_KEY as string);

const storage = new Storage(appwrite);

// 🔹 Helper function to upload to Appwrite
// 🔹 Helper function to upload translated PDF to Appwrite (same pattern as uploadDocument)
async function uploadTranslatedToAppwrite(filePath: string, fileName: string) {
  const bucketId = process.env.APPWRITE_BUCKET_ID as string;

  // Read file from disk
  const fileBuffer = fs.readFileSync(filePath);
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);

  // Create a File object for Appwrite
  const fileForUpload = new File([fileBuffer], fileName, {
    type: "application/pdf",
  });

  // Upload to Appwrite
  const uploadedFile = await storage.createFile(
    bucketId,
    "unique()",
    fileForUpload
  );

  // Generate Appwrite view URL
  const viewUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

  return { viewUrl, fileId: uploadedFile.$id, fileSizeInMB };
}

export const documentTranslation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let lang = String(req.query.lang || "yo");
    let download = String(req.query.download || "false");

    // 1️⃣ Fetch document
    const doc = await prisma.document.findUnique({ where: { id: Number(id) } });
    if (!doc) return void res.status(404).json({ error: "Document not found" });
    if (!doc.signedUrl)
      return void res
        .status(400)
        .json({ error: "Document file not available" });

    // 2️⃣ Check cached translation
    let translation = await prisma.translationCache.findFirst({
      where: { documentId: Number(id), language: lang },
    });

    if (!translation) {
      console.log("📄 Downloading and reading original PDF...");
      const response = await axios.get(doc.signedUrl, {
        responseType: "arraybuffer",
      });
      const pdfBuffer = Buffer.from(response.data, "binary");

      const pdfData = await pdfParse(pdfBuffer);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        return void res.status(400).json({ error: "No text found in PDF" });
      }

      // ✂️ Split text into pages and paragraphs
      console.log("🧩 Splitting text into structured pages...");
      const pages = pdfData.text
        .split(/\f+/)
        .map((page) => page.trim())
        .filter((p) => p.length > 0);

      const translatedPages: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        console.log(`🌍 Translating page ${i + 1}/${pages.length}...`);

        const paragraphs = pages[i]
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        const translatedParagraphs: string[] = [];

        for (const paragraph of paragraphs) {
          const chunks = chunkText(paragraph, 3000);
          let translatedParagraph = "";

          for (const chunk of chunks) {
            const resp = await translationClient.translateText({
              parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
              contents: [chunk],
              mimeType: "text/plain",
              sourceLanguageCode: "en",
              targetLanguageCode: lang,
            });

            const data = Array.isArray(resp) ? resp[0] : (resp as any);
            if (data?.translations?.[0]?.translatedText) {
              translatedParagraph += data.translations[0].translatedText + " ";
            }
          }

          translatedParagraphs.push(translatedParagraph.trim());
        }

        translatedPages.push(translatedParagraphs.join("\n\n"));
      }

      const translatedText = translatedPages.join("\f\n");

      // 💾 Create a temp PDF file for Appwrite upload
      const outputDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const outputPath = path.join(outputDir, `translated-${id}-${lang}.pdf`);
      const pdfDoc = new PDFDocument({ margin: 40, autoFirstPage: false });

      const fontPath = path.join(
        __dirname,
        "../../assets/fonts/static/NotoSans-Regular.ttf"
      );
      if (fs.existsSync(fontPath)) {
        pdfDoc.registerFont("NotoSans", fontPath);
        pdfDoc.font("NotoSans");
      }

      pdfDoc.pipe(fs.createWriteStream(outputPath));

      const pagesAgain = translatedText.split(/\f+/);
      for (let i = 0; i < pagesAgain.length; i++) {
        pdfDoc.addPage();
        const paragraphs = pagesAgain[i].split(/\n\s*\n/);
        pdfDoc.fontSize(12);
        paragraphs.forEach((para) => {
          pdfDoc.text(para.trim(), {
            align: "justify",
            lineGap: 6,
            paragraphGap: 12,
          });
        });
        if (i < pagesAgain.length - 1) pdfDoc.addPage();
      }
      pdfDoc.end();

      // Wait until PDF is finished writing before uploading
      await new Promise((resolve) => pdfDoc.on("end", resolve));

      // ☁️ Upload to Appwrite
      console.log("☁️ Uploading translated PDF to Appwrite...");
      const { viewUrl, fileId, fileSizeInMB } =
        await uploadTranslatedToAppwrite(
          outputPath,
          `translated-${id}-${lang}.pdf`
        );

      // 💾 Cache translation in DB
      translation = await prisma.translationCache.create({
        data: {
          documentId: Number(id),
          language: lang,
          translated: translatedText,
          fileUrl: viewUrl, // ✅ same as uploadDocument.signedUrl
          // fileSize: fileSizeInMB, // optional but good to keep consistent
        },
      });

      fs.unlinkSync(outputPath); // cleanup local temp file
    }

    // 🧾 4️⃣ If download requested
    if (download === "true") {
      console.log("📘 Downloading translated PDF from Appwrite...");

      // Redirect or stream the Appwrite file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=translated-${id}-${lang}.pdf`
      );
      return res.redirect(translation.fileUrl || "#");
    }

    // 5️⃣ JSON Response
    res.status(200).json({
      id: doc.id,
      title: doc.title,
      language: lang,
      translation: translation.translated,
      fileUrl: translation.fileUrl,
    });
  } catch (error) {
    console.error("❌ Error translating document:", error);
    res.status(500).json({ error: "Failed to translate document" });
  }
};



/**
 * Helper function to chunk long text by sentence
 */
function chunkText(text: string, maxLength = 3000): string[] {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current.trim());
      current = sentence + " ";
    } else {
      current += sentence + " ";
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

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

    const response = translations.reduce((acc: Record<string, string>, t: { key: string; value: string }) => {
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
