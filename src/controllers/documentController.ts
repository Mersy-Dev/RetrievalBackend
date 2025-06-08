import { Request, Response } from "express";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

// /api/documents/search?q=malaria+symptoms
export const searchDocuments = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  try {
    const results = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { summary: { contains: query } },
          { content: { contains: query } },
        ],
      },
      take: 10, // pagination placeholder
    });

    res.json(results);
  } catch (error) {
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
