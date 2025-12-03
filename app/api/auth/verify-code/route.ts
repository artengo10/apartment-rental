import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log("Verifying code for:", email);

    // Ищем пользователя во временной таблице
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email },
    });

    if (!pendingUser) {
      return NextResponse.json(
        { error: "Пользователь не найден или срок действия кода истек" },
        { status: 404 }
      );
    }

    // Проверяем код
    if (pendingUser.verificationCode !== code) {
      return NextResponse.json(
        { error: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    // Проверяем срок действия кода
    if (pendingUser.codeExpires < new Date()) {
      await prisma.pendingUser.delete({ where: { id: pendingUser.id } });
      return NextResponse.json(
        {
          error:
            "Срок действия кода истек. Пожалуйста, зарегистрируйтесь снова.",
        },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже пользователя в основной таблице
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await prisma.pendingUser.delete({ where: { id: pendingUser.id } });
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Создаем пользователя в основной таблице
    const user = await prisma.user.create({
      data: {
        email: pendingUser.email,
        password: pendingUser.password,
        name: pendingUser.name,
        phone: pendingUser.phone,
        isVerified: true,
      },
    });

    console.log("User created in main table:", user.id);

    // Удаляем из временной таблицы
    await prisma.pendingUser.delete({ where: { id: pendingUser.id } });

    // Генерируем токен
    const token = generateToken(user.id);

    // Возвращаем токен и данные пользователя
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: "Аккаунт успешно подтвержден",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке кода" },
      { status: 500 }
    );
  }
}
