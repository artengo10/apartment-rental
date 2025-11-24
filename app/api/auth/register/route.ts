import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  generateVerificationCode,
  sendVerificationCode,
} from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTRATION START ===");

    const body = await request.json();
    console.log("Request body:", body);

    const { name, email, phone, password,} = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Генерируем код подтверждения
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log("Creating user...");

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        // Убираем role
        verificationCode,
        codeExpires,
        isVerified: false,
      },
    });

    console.log("User created successfully:", {
      id: user.id,
      email: user.email,
    });

    // Отправляем код подтверждения (в консоль для разработки)
    await sendVerificationCode(email, verificationCode);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Код подтверждения отправлен на ваш email",
        user: userWithoutPassword,
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
