import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

// /api/documents/search?q=malaria+symptoms
export const searchDocuments = async (req: Request, res: Response): Promise<void> => {
  console.log("🔥 searchDocuments function triggered");
  const query = req.query.q as string;

  if (!query) {
    console.log("No query received");
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return Promise.resolve(); // Early return with resolved promise
  }

  console.log(`Received search query: ${query}`);

  try {
    const results = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { content: { contains: query } },
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
