import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const chatId = parseInt(params.chatId);

    // Проверяем доступ к чату
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ tenantId: userId }, { hostId: userId }],
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    return NextResponse.json(
      { error: "Ошибка при получении сообщений" },
      { status: 500 }
    );
  }
}
