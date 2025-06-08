// prisma/seed/document.ts
import prisma from "../../config/database";
// const prisma = new PrismaClient();

export const seedDocuments = async () => {
  await prisma.document.createMany({
    data: [
      {
        title: "Common Symptoms of Malaria in Children",
        summary: "Overview of early warning signs in children under age 12...",
        content: "Children typically experience fever, chills, sweating...",
      },
      {
        title: "2025 WHO Guidelines for Malaria Treatment",
        summary: "Treatment protocols for both mild and severe malaria...",
        content: "According to WHO 2025 guidelines...",
      },
      {
        title: "Malaria Outbreaks in West Africa – Case Report",
        summary: "Outbreaks in 2024 across West Africa...",
        content: "Detailed analysis of case reports...",
      },
    ],
  });
};
