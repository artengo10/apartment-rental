import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Токен не предоставлен" },
        { status: 401 }
      );
    }

    // Проверяем токен
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Возвращаем данные пользователя
    const {
      password,
      verificationCode,
      codeExpires,
      ...userWithoutSensitiveData
    } = user;

    return NextResponse.json(userWithoutSensitiveData);
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
  }
}
