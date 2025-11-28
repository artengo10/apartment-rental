// app/api/favorites/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
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

    // ВАЖНО: добавляем фильтр isActive: true
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        apartment: {
          include: {
            host: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Преобразуем в формат Apartment
    const apartments = favorites.map((fav) => ({
      id: fav.apartment.id,
      lat: fav.apartment.lat || 56.2965,
      lng: fav.apartment.lng || 43.9361,
      title: fav.apartment.title,
      price: `${fav.apartment.price}₽`,
      address: fav.apartment.address,
      description: fav.apartment.description,
      type: fav.apartment.type.toLowerCase() as
        | "apartment"
        | "house"
        | "studio",
      district: fav.apartment.district,
      rooms: fav.apartment.rooms,
      area: fav.apartment.area,
      floor: fav.apartment.floor,
      images: fav.apartment.images,
      amenities: fav.apartment.amenities,
      hostName: fav.apartment.host.name,
      hostId: fav.apartment.hostId,
      hostRating: 4.5,
    }));

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке избранных" },
      { status: 500 }
    );
  }
}

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

    const { apartmentId } = await request.json();

    // Проверяем, существует ли квартира
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      );
    }

    // ИСПРАВЛЕНИЕ: Проверяем существующую запись (включая неактивные)
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        apartmentId,
      },
    });

    if (existingFavorite) {
      // Если запись существует, но неактивна - активируем ее
      if (!existingFavorite.isActive) {
        const updatedFavorite = await prisma.favorite.update({
          where: { id: existingFavorite.id },
          data: { isActive: true },
        });
        return NextResponse.json({ success: true, favorite: updatedFavorite });
      }

      // Если запись уже активна - возвращаем успех (идемпотентность)
      return NextResponse.json({ success: true, favorite: existingFavorite });
    }

    // Создаем новую запись
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        apartmentId,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Ошибка при добавлении в избранное" },
      { status: 500 }
    );
  }
}
