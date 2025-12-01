import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken"; // Добавить импорт

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // ПРОВЕРКА АВТОРИЗАЦИИ - ДОБАВИТЬ
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

    const hostId = parseInt(params.hostId);

    // ПРОВЕРКА ДОСТУПА - ДОБАВИТЬ
    if (userId !== hostId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const apartments = await prisma.apartment.findMany({
      where: {
        hostId: hostId,
      },
      include: {
        host: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedApartments = apartments.map((apartment) => ({
      id: apartment.id,
      lat: apartment.lat || 56.2965,
      lng: apartment.lng || 43.9361,
      title: apartment.title,
      price: `${apartment.price}₽`,
      address: apartment.address,
      description: apartment.description,
      type: apartment.type.toLowerCase() as "apartment" | "house" | "studio",
      district: apartment.district,
      rooms: apartment.rooms,
      area: apartment.area,
      floor: apartment.floor,
      images: apartment.images || [],
      amenities: apartment.amenities,
      hostName: apartment.host.name,
      hostId: apartment.hostId,
      hostRating: 4.5,
      status: apartment.status,
      isPublished: apartment.isPublished,
      createdAt: apartment.createdAt.toISOString(), // Изменить на строку
      publishedAt: apartment.publishedAt?.toISOString(), // Изменить на строку
      rejectionReason: apartment.rejectionReason, // ДОБАВИТЬ: причина отказа
    }));

    return NextResponse.json(transformedApartments);
  } catch (error) {
    console.error("Error fetching host apartments:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявлений" },
      { status: 500 }
    );
  }
}
