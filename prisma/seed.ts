import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert Professor
  await prisma.user.upsert({
    where: { email: "yehyu2004@gapp.nthu.edu.tw" },
    update: { role: "PROFESSOR" },
    create: {
      email: "yehyu2004@gapp.nthu.edu.tw",
      name: "Professor",
      role: "PROFESSOR",
    },
  });

  // Upsert TA
  await prisma.user.upsert({
    where: { email: "ta@gapp.nthu.edu.tw" },
    update: { role: "TA" },
    create: {
      email: "ta@gapp.nthu.edu.tw",
      name: "TA",
      role: "TA",
    },
  });

  // Get professor for assignment creation
  const professor = await prisma.user.findUnique({
    where: { email: "yehyu2004@gapp.nthu.edu.tw" },
  });

  if (!professor) throw new Error("Professor not found after upsert");

  // Create Report 1
  await prisma.assignment.upsert({
    where: {
      id: "report-1",
    },
    update: {},
    create: {
      id: "report-1",
      title: "Observational Cosmology Report 1",
      description:
        "Write a report on one of the following topics from the textbook: the cosmic distance ladder, Hubble expansion, or the cosmic microwave background. Your report should demonstrate understanding of the observational techniques and their significance in modern cosmology.",
      reportNumber: 1,
      totalPoints: 100,
      published: true,
      rubric:
        "Scientific Accuracy (30pts): Correct understanding of cosmological concepts and equations.\nAnalysis Quality (25pts): Depth of analysis, use of data, and logical reasoning.\nPresentation (20pts): Clear writing, proper structure, figures and references.\nOriginal Insight (15pts): Evidence of independent thinking beyond textbook material.\nFormatting (10pts): Proper citation format, page length, and professional layout.",
      createdById: professor.id,
    },
  });

  // Create Report 2
  await prisma.assignment.upsert({
    where: {
      id: "report-2",
    },
    update: {},
    create: {
      id: "report-2",
      title: "Observational Cosmology Report 2",
      description:
        "Write a report on one of the following topics: dark matter evidence from galaxy rotation curves, Big Bang nucleosynthesis, or the Friedmann equation and the fate of the universe. Include quantitative analysis where appropriate.",
      reportNumber: 2,
      totalPoints: 100,
      published: true,
      rubric:
        "Scientific Accuracy (30pts): Correct understanding of cosmological concepts and equations.\nAnalysis Quality (25pts): Depth of analysis, use of data, and logical reasoning.\nPresentation (20pts): Clear writing, proper structure, figures and references.\nOriginal Insight (15pts): Evidence of independent thinking beyond textbook material.\nFormatting (10pts): Proper citation format, page length, and professional layout.",
      createdById: professor.id,
    },
  });

  console.log("Seed complete: professor, TA, and 2 assignments created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
