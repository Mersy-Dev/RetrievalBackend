import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";
import { uploadToCloudinary } from "../lib/cloudinary";


const prisma = new PrismaClient();

// /api/documents/search?q=malaria+symptoms
export const searchDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query.q as string;

  if (!query) {
    console.log("No query received");
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return Promise.resolve(); // Early return with resolved promise
  }

  try {
    const results = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { content: { contains: query } },
          { author: { contains: query } },
          { sourceUrl: { contains: query } },
        ],
      },
      take: 10,
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
    const { title, summary, content, author, publicationYear, sourceUrl } =
      req.body;

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

    const newDocument = await prisma.document.create({
      data: {
        title,
        summary,
        content,
        author,
        publicationYear: parseInt(publicationYear),
        sourceUrl,
        cloudinaryUrl: cloudinaryResponse.secure_url,
      },
    });

    res
      .status(201)
      .json({
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
