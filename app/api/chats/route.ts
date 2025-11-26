import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Token received in API:", token);

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log("✅ Decoded JWT:", decoded);
      userId = decoded.userId;
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    console.log("👤 User ID from token:", userId);

    // Проверим, существует ли пользователь
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.log("❌ User not found in database");
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    console.log("📡 Fetching chats for user:", userId);

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ tenantId: userId }, { hostId: userId }],
      },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(`✅ Found ${chats.length} chats for user ${userId}`);

    // Добавляем количество непрочитанных сообщений
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            isRead: false,
            NOT: {
              senderId: userId,
            },
          },
        });

        return {
          ...chat,
          unreadCount,
        };
      })
    );

    return NextResponse.json(chatsWithUnreadCount);
  } catch (error) {
    console.error("❌ Ошибка при получении чатов:", error);
    return NextResponse.json(
      { error: "Ошибка при получении чатов" },
      { status: 500 }
    );
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Token received in API:", token);

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log("✅ Decoded JWT:", decoded);
      userId = decoded.userId;
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const { apartmentId } = await request.json();
    console.log(
      "🏠 Creating chat for apartment:",
      apartmentId,
      "user:",
      userId
    );

    // Находим квартиру в базе данных
    const apartment = await prisma.apartment.findUnique({
      where: { id: parseInt(apartmentId) },
    });

    if (!apartment) {
      console.log("❌ Apartment not found");
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      );
    }

    const hostId = apartment.hostId;
    console.log("👤 Host ID from apartment:", hostId);

    if (userId === hostId) {
      console.log("❌ User cannot chat with themselves");
      return NextResponse.json(
        { error: "Нельзя создать чат с самим собой" },
        { status: 400 }
      );
    }

    // Проверяем существующий чат
    const existingChat = await prisma.chat.findFirst({
      where: {
        apartmentId: parseInt(apartmentId),
        tenantId: userId,
        hostId: hostId,
      },
      include: {
        apartment: true,
        tenant: true,
        host: true,
      },
    });

    if (existingChat) {
      console.log("✅ Existing chat found:", existingChat.id);
      return NextResponse.json(existingChat);
    }

    // Создаем новый чат
    const newChat = await prisma.chat.create({
      data: {
        apartmentId: parseInt(apartmentId),
        tenantId: userId,
        hostId: hostId,
      },
      include: {
        apartment: true,
        tenant: true,
        host: true,
      },
    });

    // После создания чата
    console.log("✅ New chat created:", newChat.id);
    return NextResponse.json(newChat);
  } catch (error) {
    console.error("❌ Ошибка при создании чата:", error);
    return NextResponse.json(
      { error: "Ошибка при создании чата" },
      { status: 500 }
    );
  }
}
