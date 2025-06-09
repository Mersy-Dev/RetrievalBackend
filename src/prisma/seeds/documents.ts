// prisma/seed/document.ts
import prisma from "../../config/database";

export const seedDocuments = async () => {
  // Step 1: Seed Tags
  const malariaTag = await prisma.tag.upsert({
    where: { name: "Malaria" },
    update: {},
    create: { name: "Malaria" },
  });

  const childrenTag = await prisma.tag.upsert({
    where: { name: "Children" },
    update: {},
    create: { name: "Children" },
  });

  const whoTag = await prisma.tag.upsert({
    where: { name: "WHO" },
    update: {},
    create: { name: "WHO" },
  });

  const outbreakTag = await prisma.tag.upsert({
    where: { name: "Outbreak" },
    update: {},
    create: { name: "Outbreak" },
  });

  // Step 2: Seed Documents with Tag Associations
  await prisma.document.create({
    data: {
      title: "Common Symptoms of Malaria in Children",
      summary: "Overview of early warning signs in children under age 12...",
      content: "Children typically experience fever, chills, sweating...",
      author: "Dr. Amina Yusuf",
      publicationYear: 2023,
      cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/malaria-symptoms.pdf",
      sourceUrl: "https://example.com/malaria-symptoms",
      tags: {
        connect: [{ id: malariaTag.id }, { id: childrenTag.id }],
      },
    },
  });

  await prisma.document.create({
    data: {
      title: "2025 WHO Guidelines for Malaria Treatment",
      summary: "Treatment protocols for both mild and severe malaria...",
      content: "According to WHO 2025 guidelines...",
      author: "World Health Organization",
      publicationYear: 2025,
      cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/who-malaria-guidelines.pdf",
      sourceUrl: "https://www.who.int/guidelines/malaria",
      tags: {
        connect: [{ id: malariaTag.id }, { id: whoTag.id }],
      },
    },
  });

  await prisma.document.create({
    data: {
      title: "Malaria Outbreaks in West Africa – Case Report",
      summary: "Outbreaks in 2024 across West Africa...",
      content: "Detailed analysis of case reports...",
      author: "Dr. Kofi Mensah",
      publicationYear: 2024,
      cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/west-africa-outbreak.pdf",
      sourceUrl: null,
      tags: {
        connect: [{ id: malariaTag.id }, { id: outbreakTag.id }],
      },
    },
  });
};
