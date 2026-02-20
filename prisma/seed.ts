import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const existing = await prisma.video.count();
  if (existing === 0) {
    await prisma.video.create({
      data: {
        publishedAt: new Date(),
        title: "Sample video",
        hadAce: false,
      },
    });
    console.log("Seed: created one sample video (no ace).");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
