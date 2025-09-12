import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";
import { uploadToCloudinary } from "../lib/cloudinary";


const prisma = new PrismaClient();

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
      tags, // optional: array of tag IDs or names
    } = req.body;

    if (!req.files || !req.files.document) {
      res.status(400).json({ error: "No document file uploaded" });
      return;
    }

    let documentFile = req.files.document;
    if (Array.isArray(documentFile)) {
      documentFile = documentFile[0];
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(documentFile);

    // Create document with tags if provided
    const newDocument = await prisma.document.create({
      data: {
        title,
        description,
        author,
        publishedYear: parseInt(publishedYear),
        publisher: publisher || null,
        referenceLink: referenceLink || null,
        cloudinaryUrl: cloudinaryResponse.secure_url,
        tags: tags
          ? {
              connectOrCreate: tags.map((tagName: string) => ({
                where: { name: tagName },
                create: { name: tagName },
              })),
            }
          : undefined,
      },
      include: { tags: true }, // return associated tags
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Document upload failed." });
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
