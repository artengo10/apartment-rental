// app/api/reviews/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");
    const chatId = searchParams.get("chatId");

    if (!hostId) {
      return NextResponse.json({ error: "hostId обязателен" }, { status: 400 });
    }

    // Проверяем, оставлял ли пользователь уже отзыв
    const review = await prisma.review.findFirst({
      where: {
        authorId: userId,
        hostId: parseInt(hostId),
        ...(chatId && { chatId: parseInt(chatId) }),
      },
    });

    return NextResponse.json({ hasReviewed: !!review });
  } catch (error) {
    console.error("Error checking review:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке отзыва" },
      { status: 500 }
    );
  }
}
