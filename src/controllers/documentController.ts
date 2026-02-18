import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";
import { supabase } from "../utils/supabaseClient"; // 👈 we'll create this
import fileUpload, { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import pdfParse from "pdf-parse";
import { storage } from "../utils/appwrite"; // from the setup file above
import mammoth from "mammoth"; // for docx

const prisma = new PrismaClient();

// Get a single document by ID
// Get a single document by ID

export const getSingleDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ Fetch document with all related data
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: {
        tags: true,
        relatedDocs: true,
        relatedByDocuments: true,
        feedbacks: true,
      },
    });

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // ✅ Generate Appwrite file view URL (public bucket only)
    const bucketId = process.env.APPWRITE_BUCKET_ID!;
    const projectId = process.env.APPWRITE_PROJECT_ID!;
    const fileId = document.storageUrl; // 👈 make sure you saved Appwrite fileId here

    const endpoint =
      process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";

    const signedUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

    // ✅ Return complete document
    res.status(200).json({
      ...document,
      signedUrl,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document." });
  }
};
// Get all documents
export const getAllDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: "desc", // optional: sort by newest first
      },
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    res.status(500).json({ error: "Failed to fetch documents." });
  }
};

// /api/documents/search?q=malaria+symptoms
export const searchDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query.q as string;

  if (!query) {
    console.log("No query received");
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const results = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { author: { contains: query } },
          { publisher: { contains: query } },
          { referenceLink: { contains: query } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { tags: true }, // include related tags
    });

    console.log(`Search query: ${query}, Results found: ${results.length}`);
    res.status(200).json(results);
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed." });
  }
};

// /api/documents/upload
export const uploadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      titleYo,
      description,
      descriptionYo,
      author,
      authorYo,
      publishedYear,
      publisher,
      referenceLink,
      tags,
    } = req.body;

    if (!req.files || !req.files.document) {
      res.status(400).json({ error: "No document file uploaded" });
      return;
    }

    let documentFile = req.files.document as UploadedFile;
    if (Array.isArray(documentFile)) {
      documentFile = documentFile[0];
    }

    // ✅ Normalize tags
    let tagsArray: string[] = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string") {
        try {
          tagsArray = JSON.parse(tags);
        } catch {
          tagsArray = tags.split(",").map((t) => t.trim());
        }
      }
    }

    console.log("File received:", {
      name: documentFile.name,
      size: documentFile.size,
      mimetype: documentFile.mimetype,
    });

    const bucketId = process.env.APPWRITE_BUCKET_ID as string;

    const fileForUpload = new File(
      [new Uint8Array(documentFile.data)],
      documentFile.name,
      { type: documentFile.mimetype }
    );

    const uploadedFile = await storage.createFile(
      bucketId,
      "unique()",
      fileForUpload
    );

    // ✅ File size in MB
    const fileSizeInMB = documentFile.size / (1024 * 1024);

    // ✅ Extract pages + reading time depending on file type
    let pages: number | null = null;
    let estimatedReadingTime: number | null = null;

    if (documentFile.mimetype === "application/pdf") {
      // PDF
      try {
        const pdfData = await pdfParse(documentFile.data);
        pages = pdfData.numpages;

        const text = pdfData.text || "";
        const wordCount = text.split(/\s+/).length;
        estimatedReadingTime = Math.ceil(wordCount / 200);
      } catch (err) {
        console.warn("⚠️ Failed to parse PDF:", err);
      }
    } else if (
      documentFile.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // DOCX
      try {
        const result = await mammoth.extractRawText({
          buffer: documentFile.data,
        });
        const text = result.value || "";
        const wordCount = text.split(/\s+/).length;
        estimatedReadingTime = Math.ceil(wordCount / 200);
        // Approx pages: ~500 words per page
        pages = Math.ceil(wordCount / 500);
      } catch (err) {
        console.warn("⚠️ Failed to parse DOCX:", err);
      }
    } else if (documentFile.mimetype === "text/plain") {
      // TXT
      try {
        const text = documentFile.data.toString("utf-8");
        const wordCount = text.split(/\s+/).length;
        estimatedReadingTime = Math.ceil(wordCount / 200);
        pages = Math.ceil(wordCount / 500);
      } catch (err) {
        console.warn("⚠️ Failed to parse TXT:", err);
      }
    } else {
      console.log(
        "⚠️ Unsupported mimetype for parsing:",
        documentFile.mimetype
      );
    }

    // ✅ Generate a preview URL
    const viewUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

    // ✅ Save document metadata to DB
    const newDocument = await prisma.document.create({
      data: {
        title,
        titleYo: titleYo || null,
        description,
        descriptionYo: descriptionYo || null,
        author,
        authorYo: authorYo || null,
        publishedYear: publishedYear ? parseInt(publishedYear, 10) : 0,
        publisher: publisher || null,
        referenceLink: referenceLink || null,
        storageUrl: uploadedFile.$id,
        signedUrl: viewUrl,
        fileSize: fileSizeInMB,
        pages,
        readingTime: estimatedReadingTime,
        tags: tagsArray.length
          ? {
              connectOrCreate: tagsArray.map((tagName: string) => ({
                where: { name: tagName },
                create: { name: tagName },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    res.status(201).json({
      message: "✅ Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Document upload failed." });
  }
};

//edit documents
export const updateDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      titleYo,
      description,
      descriptionYo,
      author,
      authorYo,
      publishedYear,
      publisher,
      referenceLink,
      tags,
    } = req.body;

    // ✅ Find existing document
    const existingDoc = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { tags: true },
    });

    if (!existingDoc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // ✅ Handle file update (if provided)
    let updatedStorageUrl = existingDoc.storageUrl;
    let updatedSignedUrl = existingDoc.signedUrl;
    let fileSizeInMB = existingDoc.fileSize;

    if (req.files && req.files.document) {
      let documentFile = req.files.document as UploadedFile;
      if (Array.isArray(documentFile)) {
        documentFile = documentFile[0];
      }

      const fileExt = documentFile.name.split(".").pop();
      const filePath = `uploads/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, documentFile.data, {
          contentType: documentFile.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError.message);
        res.status(500).json({ error: "Failed to upload document" });
        return;
      }

      // ✅ Generate new signed URL
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("documents")
          .createSignedUrl(filePath, 60 * 60 * 24);

      if (signedUrlError) {
        console.error("Signed URL error:", signedUrlError.message);
        res.status(500).json({ error: "Failed to generate signed URL" });
        return;
      }

      updatedStorageUrl = filePath;
      updatedSignedUrl = signedUrlData?.signedUrl || null;
      fileSizeInMB = documentFile.size / (1024 * 1024);
    }

    // ✅ Handle tags update
    let tagsArray: string[] = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string") {
        tagsArray = tags.split(",").map((t) => t.trim());
      }
    }

    // ✅ Update document
    const updatedDocument = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        title: title ?? existingDoc.title,
        titleYo: titleYo ?? existingDoc.titleYo,
        description: description ?? existingDoc.description,
        descriptionYo: descriptionYo ?? existingDoc.descriptionYo,
        author: author ?? existingDoc.author,
        authorYo: authorYo ?? existingDoc.authorYo,
        publishedYear: publishedYear
          ? parseInt(publishedYear, 10)
          : existingDoc.publishedYear,
        publisher: publisher ?? existingDoc.publisher,
        referenceLink: referenceLink ?? existingDoc.referenceLink,
        storageUrl: updatedStorageUrl,
        signedUrl: updatedSignedUrl,
        fileSize: fileSizeInMB,
        readingTime: existingDoc.readingTime,
        pages: existingDoc.pages,
        ...(tagsArray.length && {
          tags: {
            set: [], // disconnect old tags first
            connectOrCreate: tagsArray.map((tagName: string) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        }),
      },
      include: { tags: true },
    });

    res.status(200).json({
      message: "✅ Document updated successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Document update failed." });
  }
};

// ✅ Delete a document
export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ Check if document exists
    const existingDoc = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!existingDoc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // ✅ Delete from Prisma
    await prisma.document.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Document deletion failed." });
  }
};

// Optional: for displaying suggested tags
export const getTagSuggestions = async (_req: Request, res: Response) => {
  const tags = [
    "Malaria Symptoms",
    "Treatment Guidelines",
    "Regional Outbreaks",
    "Latest Research",
    "Case Studies",
    "Preventive Measures",
    "Malaria in Children",
  ];

  res.json(tags);
};
