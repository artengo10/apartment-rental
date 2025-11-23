import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Проверяем подключение к базе данных
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Находим пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 400 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 400 }
      );
    }

    // Проверяем, верифицирован ли аккаунт
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Аккаунт не активирован. Проверьте ваш email для кода подтверждения.",
        },
        { status: 400 }
      );
    }

    // Генерируем токен
    const token = generateToken(user.id);

    // Возвращаем токен и данные пользователя
    const {
      password: _,
      verificationCode: __,
      codeExpires: ___,
      ...userWithoutSensitiveData
    } = user;

    return NextResponse.json({
      token,
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ошибка при входе" }, { status: 500 });
  }
}
