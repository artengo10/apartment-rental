import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  generateVerificationCode,
  sendVerificationCode,
} from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role } = await request.json();

    // Проверяем, существует ли уже пользователь с таким email
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
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // Код действует 10 минут

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        verificationCode,
        codeExpires,
      },
    });

    // Отправляем код подтверждения на email
    await sendVerificationCode(email, verificationCode);

    // Возвращаем ответ без пароля и кода
    const {
      password: _,
      verificationCode: __,
      codeExpires: ___,
      ...userWithoutSensitiveData
    } = user;

    return NextResponse.json(
      {
        message: "Код подтверждения отправлен на ваш email",
        user: userWithoutSensitiveData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
