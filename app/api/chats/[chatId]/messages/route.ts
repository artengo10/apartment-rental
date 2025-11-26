import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    console.log("📨 Received message send request");

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const userId = decoded.userId;
    const chatId = parseInt(params.chatId);
    const { content } = await request.json();

    console.log("🔍 Message details:", { userId, chatId, content });

    if (!content || content.trim() === "") {
      console.log("❌ Empty message content");
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
      console.log("❌ Chat not found or no access");
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

    console.log("✅ Message created:", message.id);

    // Обновляем время последнего сообщения в чате
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    console.log("✅ Chat updated timestamp");

    return NextResponse.json(message);
  } catch (error) {
    console.error("❌ Ошибка при отправке сообщения:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке сообщения" },
      { status: 500 }
    );
  }
}
