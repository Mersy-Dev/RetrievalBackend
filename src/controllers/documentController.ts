import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";
// import { uploadToCloudinary } from "../lib/cloudinary";
import { supabase } from "../utils/supabaseClient"; // 👈 we'll create this
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Get a single document by ID
export const getSingleDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ Find document by ID including tags
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { tags: true },
    });

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.status(200).json(document);
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
      description,
      author,
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
        tagsArray = tags.split(",").map((t) => t.trim());
      }
    }

    console.log("File received:", {
      name: documentFile.name,
      size: documentFile.size,
      mimetype: documentFile.mimetype,
    });

    // ✅ Upload file to Supabase Storage
    const fileExt = documentFile.name.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${uniqueFileName}`; // 👈 folder inside bucket

    const { error: uploadError } = await supabase.storage
      .from("documents") // 👈 MUST match your bucket name in Supabase UI
      .upload(filePath, documentFile.data, {
        contentType: documentFile.mimetype,
        upsert: true, // 👈 allow overwrite if file exists
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      res.status(500).json({ error: "Failed to upload to Supabase" });
      return;
    }

    // ✅ Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    // ✅ Save metadata to DB
    const newDocument = await prisma.document.create({
      data: {
        title,
        description,
        author,
        publishedYear: publishedYear ? parseInt(publishedYear, 10) : 0,
        publisher: publisher || null,
        referenceLink: referenceLink || null,
        storageUrl: publicUrl,
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
//edit documentsy
export const updateDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      author,
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
    if (req.files && req.files.document) {
      let documentFile = req.files.document as UploadedFile;
      if (Array.isArray(documentFile)) {
        documentFile = documentFile[0];
      }

      const fileExt = documentFile.name.split(".").pop();
      const filePath = `documents/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, documentFile.data, {
          contentType: documentFile.mimetype,
          upsert: true, // 👈 allow overwrite if same filePath
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError.message);
        res.status(500).json({ error: "Failed to upload document" });
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      updatedStorageUrl = publicUrl;
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
        description: description ?? existingDoc.description,
        author: author ?? existingDoc.author,
        publishedYear: publishedYear
          ? parseInt(publishedYear, 10)
          : existingDoc.publishedYear,
        publisher: publisher ?? existingDoc.publisher,
        referenceLink: referenceLink ?? existingDoc.referenceLink,
        storageUrl: updatedStorageUrl,
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
      message: "Document updated successfully",
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
  ];

  res.json(tags);
};
