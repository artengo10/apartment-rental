import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = "admin@example.com"; // ЗАМЕНИТЕ на ваш email
  const password = "admin123"; // ЗАМЕНИТЕ на ваш пароль
  const name = "Главный администратор";

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Проверяем, нет ли уже админа
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("❌ Админ с таким email уже существует");
      return;
    }

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("✅ Админ создан!");
    console.log("Email:", email);
    console.log("Пароль:", password);
    console.log("Не забудьте сменить пароль после первого входа!");
  } catch (error) {
    console.error("❌ Ошибка создания админа:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
