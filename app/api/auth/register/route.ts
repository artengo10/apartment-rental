import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  generateVerificationCode,
  sendVerificationCode,
} from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTRATION START ===");

    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверяем существование в основной таблице
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Удаляем старые pending записи для этого email
    await prisma.pendingUser.deleteMany({
      where: { email },
    });

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Генерируем код подтверждения
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log("Creating pending user...");

    // Создаем запись во временной таблице
    const pendingUser = await prisma.pendingUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        verificationCode,
        codeExpires,
      },
    });

    console.log("Pending user created successfully:", {
      id: pendingUser.id,
      email: pendingUser.email,
    });

    // Отправляем код подтверждения
    await sendVerificationCode(email, verificationCode);

    return NextResponse.json(
      {
        message: "Код подтверждения отправлен на ваш email",
        email: pendingUser.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
