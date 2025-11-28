// app/api/chats/check/route.ts
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
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId обязателен" },
        { status: 400 }
      );
    }

    // Проверяем, есть ли чат между пользователями
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { tenantId: userId, hostId: parseInt(otherUserId) },
          { tenantId: parseInt(otherUserId), hostId: userId },
        ],
      },
    });

    return NextResponse.json({ hasChat: !!chat });
  } catch (error) {
    console.error("Error checking chat:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке чата" },
      { status: 500 }
    );
  }
}
