import { NextRequest, NextResponse } from "next/server";
import {
  generateVerificationCode,
  sendVerificationCode,
} from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь с таким email не найден" },
        { status: 404 }
      );
    }

    // Проверяем, верифицирован ли пользователь
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Аккаунт не подтвержден. Сначала завершите регистрацию." },
        { status: 400 }
      );
    }

    // Генерируем код для сброса пароля
    const resetCode = generateVerificationCode();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем код в базе
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordCodeExpires: resetExpires, // исправлено
      },
    });

    // Отправляем email с кодом
    await sendVerificationCode(
      email,
      resetCode,
      "Восстановление пароля",
      "для восстановления пароля"
    );

    return NextResponse.json({
      message: "Код для сброса пароля отправлен на ваш email",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке кода" },
      { status: 500 }
    );
  }
}
