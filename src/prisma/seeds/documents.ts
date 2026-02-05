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

  // Step 2: Seed Documents with metadata
  await prisma.document.createMany({
    data: [
      {
        title: "Common Symptoms of Malaria in Children",
        titleYo: "Àwọn ààmì àìsàn tí a rí ní àwọn ọmọ tí arun ìbà ń kàn", // Yoruba translation
        description:
          "Overview of early warning signs in children under age 12...",
        descriptionYo:
          "Àkọsílẹ̀ nípa àwọn ààmì ìkìlọ̀ àkọ́kọ́ nínú àwọn ọmọ kékeré tó wà níṣáájú ọdún mẹ́wàá lé méjì...",
        author: "Dr. Amina Yusuf",
        authorYo: "Dókítà Àmína Yúsùfù", // Yoruba translation
        publishedYear: 2023,
        publisher: "University of Ibadan Press",
        referenceLink: "https://example.com/malaria-symptoms",
        storageUrl:
          "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-1/view?project=your-project-id",
        pages: 10,
        readingTime: 12,
        fileSize: 1.8,
      },
     {
    title: "2025 WHO Guidelines for Malaria Treatment",
    titleYo: "Àwọn Ìlànà WHO fún Ìtọju Arun Ìbà ní ọdún 2025",
    description: "Treatment protocols for both mild and severe malaria...",
    descriptionYo: "Àwọn ìlànà ìtọju fún àìsàn ìbà tí kì í ṣe títí dé títí àti tí ó le lórí gan-an...",
    author: "World Health Organization",
    authorYo: "Àjọ Ìlera Agbaye (WHO)",
    publishedYear: 2025,
    publisher: "WHO",
    referenceLink: "https://www.who.int/guidelines/malaria",
    storageUrl:
      "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-2/view?project=your-project-id",
    pages: 40,
    readingTime: 45,
    fileSize: 5.6,
  },
  {
    title: "Malaria Outbreaks in West Africa – Case Report",
    titleYo: "Ìfarahàn Arun Ìbà ní Ìwọ̀-Oòrùn Áfíríkà – Ìròyìn Ìdílé",
    description: "Outbreaks in 2024 across West Africa...",
    descriptionYo: "Ìfarahàn arun ìbà ní gbogbo agbègbè Ìwọ̀-Oòrùn Áfíríkà ní ọdún 2024...",
    author: "Dr. Kofi Mensah",
    authorYo: "Dókítà Kófí Mẹnsà",
    publishedYear: 2024,
    publisher: "African Medical Journal",
    referenceLink: null,
    storageUrl:
      "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-3/view?project=your-project-id",
    pages: 18,
    readingTime: 20,
    fileSize: 3.2,
  },
  {
    title: "Preventive Measures to Reduce Malaria Risk",
    titleYo: "Àwọn Ìgbésẹ̀ Látì Dín Àfojúsùn Ìbà Kù",
    description: "Practical steps for communities to prevent malaria transmission...",
    descriptionYo: "Àwọn ìgbésẹ̀ tó lè ràn àwọn àdúgbò lọ́wọ́ láti dènà àtànkálẹ̀ arun ìbà...",
    author: "Dr. Grace Adeyemi",
    authorYo: "Dókítà Gírésì Adéyẹmí",
    publishedYear: 2022,
    publisher: "Public Health Nigeria",
    referenceLink: "https://example.com/prevent-malaria",
    storageUrl:
      "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-4/view?project=your-project-id",
    pages: 15,
    readingTime: 18,
    fileSize: 2.1,
  },
  {
    title: "Case Studies on Severe Malaria in Adults",
    titleYo: "Ìwádìí Ìdílé Nípa Arun Ìbà Tó Lórí Gan-an Nínú Àgbàlagbà",
    description: "Analysis of severe malaria cases reported in hospitals...",
    descriptionYo: "Ìtúpalẹ̀ àwọn àrùn ìbà tó le lórí tí wọ́n ti ṣe ìròyìn rẹ̀ ní ilé ìwòsàn...",
    author: "Dr. Samuel Okoro",
    authorYo: "Dókítà Sámùẹl Òkòrò",
    publishedYear: 2021,
    publisher: "Nigerian Journal of Medicine",
    referenceLink: "https://example.com/severe-malaria-cases",
    storageUrl:
      "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-5/view?project=your-project-id",
    pages: 22,
    readingTime: 25,
    fileSize: 2.7,
  },
  {
    title: "Recent Research on Malaria Parasite Resistance",
    titleYo: "Ìwádìí Tó Ṣeé Tó Lọ́wọ́ Lórí Àfarawà Arun Ìbà Sí Òògùn",
    description:
      "Updates on drug-resistant malaria strains and new research findings...",
    descriptionYo:
      "Àwọn àfihàn tuntun nípa àwọn àrùn ìbà tó ń fara da òògùn àti àwọn ìwádìí tuntun tó ń lọ lọwọ...",
    author: "Dr. Lillian Mensah",
    authorYo: "Dókítà Lílíàn Mẹnsà",
    publishedYear: 2025,
    publisher: "West African Research Institute",
    referenceLink: "https://example.com/malaria-research",
    storageUrl:
      "https://your-appwrite-endpoint/v1/storage/buckets/your-bucket-id/files/file-id-6/view?project=your-project-id",
    pages: 30,
    readingTime: 35,
    fileSize: 4.5,
  },
    ],
  });

  // Step 3: Connect Tags
  const documents = await prisma.document.findMany();

  await prisma.document.update({
    where: { id: documents[0].id },
    data: { tags: { connect: [{ id: malariaTag.id }] } },
  });

  await prisma.document.update({
    where: { id: documents[1].id },
    data: {
      tags: { connect: [{ id: malariaTag.id }, { id: treatmentTag.id }] },
    },
  });

  await prisma.document.update({
    where: { id: documents[2].id },
    data: {
      tags: { connect: [{ id: malariaTag.id }, { id: outbreakTag.id }] },
    },
  });

  await prisma.document.update({
    where: { id: documents[3].id },
    data: {
      tags: { connect: [{ id: malariaTag.id }, { id: preventionTag.id }] },
    },
  });

  await prisma.document.update({
    where: { id: documents[4].id },
    data: {
      tags: { connect: [{ id: malariaTag.id }, { id: caseStudyTag.id }] },
    },
  });

  await prisma.document.update({
    where: { id: documents[5].id },
    data: {
      tags: { connect: [{ id: malariaTag.id }, { id: researchTag.id }] },
    },
  });

  // Step 4: Add Related Documents
  await prisma.document.update({
    where: { id: documents[0].id },
    data: {
      relatedByDocuments: {
        connect: [{ id: documents[1].id }, { id: documents[2].id }],
      },
    },
  });

  await prisma.document.update({
    where: { id: documents[1].id },
    data: {
      relatedByDocuments: {
        connect: [{ id: documents[0].id }, { id: documents[5].id }],
      },
    },
  });
};
