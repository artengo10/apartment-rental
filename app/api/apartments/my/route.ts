import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Добавь эту строку - указываем что route динамический
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      // Декодируем JWT токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (jwtError) {
      // Если JWT не прошел, пробуем числовой ID
      const numericUserId = parseInt(token);
      if (isNaN(numericUserId)) {
        return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
      }
      userId = numericUserId;
    }

    // Получаем объявления пользователя
    const apartments = await prisma.apartment.findMany({
      where: { 
        hostId: userId 
      },
      orderBy: { 
        createdAt: "desc" 
      },
      include: {
        host: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
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