import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Находим пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверяем код и его срок действия
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    if (user.codeExpires && user.codeExpires < new Date()) {
      return NextResponse.json(
        { error: "Срок действия кода истек" },
        { status: 400 }
      );
    }

    // Активируем аккаунт и очищаем код
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        codeExpires: null,
      },
    });

    // Генерируем токен
    const token = generateToken(updatedUser.id);

    // Возвращаем токен и данные пользователя
    const {
      password,
      verificationCode: _,
      codeExpires: __,
      ...userWithoutSensitiveData
    } = updatedUser;

    return NextResponse.json({
      token,
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке кода" },
      { status: 500 }
    );
  }
}
