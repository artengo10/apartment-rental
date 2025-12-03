import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken"; // ← ДОБАВИТЬ

export async function GET(
  req: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // Получаем токен из заголовков
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Декодируем токен
    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (jwtError) {
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const hostId = parseInt(params.hostId);

    // Проверяем, что пользователь запрашивает свои объявления
    if (userId !== hostId) {
      return NextResponse.json(
        { error: "Нет доступа к объявлениям другого пользователя" },
        { status: 403 }
      );
    }

    // Получаем ВСЕ объявления пользователя (включая PENDING и REJECTED)
    const apartments = await prisma.apartment.findMany({
      where: {
        hostId: hostId,
      },
      include: {
        host: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Ошибка получения квартир хоста:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
