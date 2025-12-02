import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // Получаем токен из заголовков (ваша система аутентификации)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Здесь должна быть ваша логика проверки токена
    // Например, из вашего AuthContext
    // const user = await verifyToken(token);

    // Временно: проверяем, что hostId в параметрах
    const hostId = parseInt(params.hostId);

    const apartments = await prisma.apartment.findMany({
      where: {
        hostId: hostId,
        status: "APPROVED",
        isPublished: true,
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
