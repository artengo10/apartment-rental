import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (jwtError) {
      const numericUserId = parseInt(token);
      if (isNaN(numericUserId)) {
        return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
      }
      userId = numericUserId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Получаем объявления пользователя
    const apartments = await prisma.apartment.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("GET MY APARTMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявлений" },
      { status: 500 }
    );
  }
}
