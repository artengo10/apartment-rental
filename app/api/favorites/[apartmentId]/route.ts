// app/api/favorites/[apartmentId]/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET - проверка статуса избранного
export async function GET(
  request: NextRequest,
  { params }: { params: { apartmentId: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ isFavorite: false });
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (jwtError) {
      return NextResponse.json({ isFavorite: false });
    }

    const apartmentId = parseInt(params.apartmentId);

    if (isNaN(apartmentId)) {
      return NextResponse.json({ isFavorite: false });
    }

    // ИСПРАВЛЕНИЕ: Ищем только активные избранные
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        apartmentId,
        isActive: true,
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ isFavorite: false });
  }
}

// DELETE - удаление из избранного
export async function DELETE(
  request: NextRequest,
  { params }: { params: { apartmentId: string } }
) {
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
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const apartmentId = parseInt(params.apartmentId);

    if (isNaN(apartmentId)) {
      return NextResponse.json(
        { error: "Неверный ID квартиры" },
        { status: 400 }
      );
    }

    // ИСПРАВЛЕНИЕ: Находим активную запись избранного
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        apartmentId,
        isActive: true,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Не найдено в избранном" },
        { status: 404 }
      );
    }

    // Помечаем как неактивное
    await prisma.favorite.update({
      where: { id: favorite.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Удалено из избранного",
      isFavorite: false,
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении из избранного" },
      { status: 500 }
    );
  }
}
