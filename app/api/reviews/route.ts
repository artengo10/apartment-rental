// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
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

    const { rating, comment, hostId, apartmentId, chatId } =
      await request.json();

    // Валидация рейтинга
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Рейтинг должен быть от 1 до 5" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли чат между пользователями
    if (chatId) {
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          OR: [
            { tenantId: userId, hostId: hostId },
            { tenantId: hostId, hostId: userId },
          ],
        },
      });

      if (!chat) {
        return NextResponse.json(
          { error: "Нельзя оставить отзыв без общения" },
          { status: 400 }
        );
      }
    }

    // Проверяем, не оставлял ли уже пользователь отзыв этому хосту
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: userId,
        hostId: hostId,
        chatId: chatId || undefined,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Вы уже оставляли отзыв этому пользователю" },
        { status: 400 }
      );
    }

    // Создаем отзыв
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        authorId: userId,
        hostId,
        apartmentId: apartmentId || undefined,
        chatId: chatId || undefined,
        status: "PENDING",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        apartment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Ошибка при создании отзыва" },
      { status: 500 }
    );
  }
}

// Получение отзывов пользователя (только APPROVED)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");

    if (!hostId) {
      return NextResponse.json({ error: "hostId обязателен" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        hostId: parseInt(hostId),
        status: "APPROVED",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        apartment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке отзывов" },
      { status: 500 }
    );
  }
}
