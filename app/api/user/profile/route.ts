import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Получаем userId из query параметров
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    let userId: number;

    if (userIdParam) {
      // Если передан userId, используем его (публичный профиль)
      userId = parseInt(userIdParam);
    } else {
      // Если userId не передан, используем авторизованного пользователя
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка при получении пользователя" },
      { status: 500 }
    );
  }
}
