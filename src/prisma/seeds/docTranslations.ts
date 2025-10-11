// prisma/seed/translation.ts
import prisma from "../../config/database";

export const seedDocTranslations = async () => {
  const documents = await prisma.document.findMany();

  if (documents.length === 0) {
    console.log("⚠️ No documents found. Run seedDocuments first.");
    return;
  }

  // Example: add Yoruba translations for the first two documents
  await prisma.translationCache.createMany({
    data: [
      {
        documentId: documents[0].id,
        language: "yo",
        translated: "Àwọn àmi àìsàn tí wọ́pọ̀ jùlọ fún ìbànújẹ arun Malaria...",
        fileUrl:
          "https://cloud.appwrite.io/v1/storage/buckets/translated-files/files/translation_1_yo/view?project=YOUR_PROJECT_ID",
      },
      {
        documentId: documents[1].id,
        language: "yo",
        translated: "Ìlànà itọju WHO fún Malaria ní ọdún 2025...",
        fileUrl:
          "https://cloud.appwrite.io/v1/storage/buckets/translated-files/files/translation_2_yo/view?project=YOUR_PROJECT_ID",
      },
    ],
  });

  console.log("✅ Translations seeded with Appwrite file URLs.");
};
