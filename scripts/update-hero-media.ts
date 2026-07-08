import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating hero CMS content...");
  
  await prisma.cMSContent.upsert({
    where: { key: "hero_video_url" },
    update: { value: "/videos/hero.mp4" },
    create: { key: "hero_video_url", value: "/videos/hero.mp4", section: "hero" },
  });

  await prisma.cMSContent.upsert({
    where: { key: "hero_video_poster" },
    update: { value: "/images/hero-poster.png" },
    create: { key: "hero_video_poster", value: "/images/hero-poster.png", section: "hero" },
  });

  console.log("Database successfully updated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
