import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";


export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}


export async function POST(
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
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым" },
        { status: 400 }
      );
    }

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

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Обновляем время последнего сообщения в чате
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке сообщения" },
      { status: 500 }
    );
  }
}
