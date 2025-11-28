import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleImages = [
  "https://i.ibb.co/NnHLMdQb/0e6f3829a02b.jpg",
  "https://i.ibb.co/0jQ5R5Z0/apartment1.jpg",
  "https://i.ibb.co/abc123/apartment2.jpg",
  // добавьте больше тестовых изображений
];

async function main() {
  console.log("🖼️ Adding sample images to apartments...");

  const apartments = await prisma.apartment.findMany();

  for (const apartment of apartments) {
    // Берем случайное изображение из sampleImages
    const randomImage =
      sampleImages[Math.floor(Math.random() * sampleImages.length)];

    await prisma.apartment.update({
      where: { id: apartment.id },
      data: {
        images: [randomImage],
      },
    });

    console.log(`✅ Added image to apartment ${apartment.id}`);
  }

  console.log("🎉 Sample images added successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
