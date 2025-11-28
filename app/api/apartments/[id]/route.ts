import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - получить объявление по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    // Получаем квартиру из базы данных
    const apartment = await prisma.apartment.findUnique({
      where: {
        id,
        status: "APPROVED", // Только одобренные
        isPublished: true,
      },
      include: {
        host: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      );
    }

    // Преобразуем данные в формат, ожидаемый фронтендом
    const transformedApartment = {
      id: apartment.id,
      lat: apartment.lat || 56.2965,
      lng: apartment.lng || 43.9361,
      title: apartment.title,
      price: `${apartment.price}₽`, // Конвертируем число в строку с рублем
      address: apartment.address,
      description: apartment.description,
      type: apartment.type.toLowerCase() as "apartment" | "house" | "studio",
      district: apartment.district,
      rooms: apartment.rooms,
      area: apartment.area,
      floor: apartment.floor,
      images: apartment.images, // images -> photos для совместимости
      amenities: apartment.amenities,
      hostName: apartment.host.name,
      hostId: apartment.hostId,
      hostRating: 4.5, // Можно добавить реальный рейтинг позже
    };

    return NextResponse.json(transformedApartment);
  } catch (error) {
    console.error("Error fetching apartment:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявления" },
      { status: 500 }
    );
  }
}
