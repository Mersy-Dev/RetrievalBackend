// prisma/seed/document.ts
import prisma from "../../config/database";

export const seedDocuments = async () => {
  // Step 1: Seed Tags
  const malariaTag = await prisma.tag.upsert({
    where: { name: "🧬 Malaria Symptoms" },
    update: {},
    create: { name: "🧬 Malaria Symptoms" },
  });

  const treatmentTag = await prisma.tag.upsert({
    where: { name: "💊 Treatment Guidelines" },
    update: {},
    create: { name: "💊 Treatment Guidelines" },
  });

  const outbreakTag = await prisma.tag.upsert({
    where: { name: "🌍 Regional Outbreaks" },
    update: {},
    create: { name: "🌍 Regional Outbreaks" },
  });

  const researchTag = await prisma.tag.upsert({
    where: { name: "📚 Latest Research" },
    update: {},
    create: { name: "📚 Latest Research" },
  });

  const caseStudyTag = await prisma.tag.upsert({
    where: { name: "📈 Case Studies" },
    update: {},
    create: { name: "📈 Case Studies" },
  });

  const preventionTag = await prisma.tag.upsert({
    where: { name: "🛡️ Preventive Measures" },
    update: {},
    create: { name: "🛡️ Preventive Measures" },
  });

  // Step 2: Seed Documents
  await prisma.document.createMany({
    data: [
      {
        title: "Common Symptoms of Malaria in Children",
        description: "Overview of early warning signs in children under age 12...",
        author: "Dr. Amina Yusuf",
        publishedYear: 2023,
        publisher: "University of Ibadan Press",
        referenceLink: "https://example.com/malaria-symptoms",
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/malaria-symptoms.pdf",
      },
      {
        title: "2025 WHO Guidelines for Malaria Treatment",
        description: "Treatment protocols for both mild and severe malaria...",
        author: "World Health Organization",
        publishedYear: 2025,
        publisher: "WHO",
        referenceLink: "https://www.who.int/guidelines/malaria",
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/who-malaria-guidelines.pdf",
      },
      {
        title: "Malaria Outbreaks in West Africa – Case Report",
        description: "Outbreaks in 2024 across West Africa...",
        author: "Dr. Kofi Mensah",
        publishedYear: 2024,
        publisher: "African Medical Journal",
        referenceLink: null,
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/west-africa-outbreak.pdf",
      },
      {
        title: "Preventive Measures to Reduce Malaria Risk",
        description: "Practical steps for communities to prevent malaria transmission...",
        author: "Dr. Grace Adeyemi",
        publishedYear: 2022,
        publisher: "Public Health Nigeria",
        referenceLink: "https://example.com/prevent-malaria",
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/malaria-prevention.pdf",
      },
      {
        title: "Case Studies on Severe Malaria in Adults",
        description: "Analysis of severe malaria cases reported in hospitals...",
        author: "Dr. Samuel Okoro",
        publishedYear: 2021,
        publisher: "Nigerian Journal of Medicine",
        referenceLink: "https://example.com/severe-malaria-cases",
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/severe-malaria.pdf",
      },
      {
        title: "Recent Research on Malaria Parasite Resistance",
        description: "Updates on drug-resistant malaria strains and new research findings...",
        author: "Dr. Lillian Mensah",
        publishedYear: 2025,
        publisher: "West African Research Institute",
        referenceLink: "https://example.com/malaria-research",
        storageUrl: "https://your-supabase-url.supabase.co/storage/v1/object/public/documents/malaria-research.pdf",
      },
    ],
  });

  // Step 3: Connect Tags to Documents
  const documents = await prisma.document.findMany();

  await prisma.document.update({
    where: { id: documents[0].id },
    data: { tags: { connect: [{ id: malariaTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[1].id },
    data: { tags: { connect: [{ id: malariaTag.id }, { id: treatmentTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[2].id },
    data: { tags: { connect: [{ id: malariaTag.id }, { id: outbreakTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[3].id },
    data: { tags: { connect: [{ id: malariaTag.id }, { id: preventionTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[4].id },
    data: { tags: { connect: [{ id: malariaTag.id }, { id: caseStudyTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[5].id },
    data: { tags: { connect: [{ id: malariaTag.id }, { id: researchTag.id }] } },
  });
};
