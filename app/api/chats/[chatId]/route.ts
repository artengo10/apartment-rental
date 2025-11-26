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

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Token received in API [chatId]:", token);

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log("✅ Decoded JWT [chatId]:", decoded);
      userId = decoded.userId;
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const chatId = parseInt(params.chatId);
    console.log("📨 Fetching chat with ID:", chatId, "for user:", userId);

    // Получаем чат с сообщениями
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ tenantId: userId }, { hostId: userId }],
      },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      console.log("❌ Chat not found");
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
    }

    console.log(`✅ Chat found, messages count: ${chat.messages.length}`);
    console.log("📝 Messages:", chat.messages);

    // Помечаем сообщения как прочитанные
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
        isRead: false,
        NOT: {
          senderId: userId,
        },
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("❌ Ошибка при получении чата:", error);
    return NextResponse.json(
      { error: "Ошибка при получении чата" },
      { status: 500 }
    );
  }
}
