import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// GET - получить все ОДОБРЕННЫЕ объявления для главной страницы
export async function GET(request: NextRequest) {
  try {
    const apartments = await prisma.apartment.findMany({
      where: {
        status: "APPROVED", // Только одобренные
        isPublished: true,
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

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявлений" },
      { status: 500 }
    );
  }
}

// POST - создать новое объявление (со статусом PENDING)
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
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

    const formData = await request.formData();

    // Извлекаем данные
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseInt(formData.get("price") as string);
    const type = formData.get("type") as "APARTMENT" | "HOUSE" | "STUDIO";
    const district = formData.get("district") as string;
    const address = formData.get("address") as string;
    const rooms = formData.get("rooms")
      ? parseInt(formData.get("rooms") as string)
      : null;
    const area = formData.get("area")
      ? parseInt(formData.get("area") as string)
      : null;
    const floor = formData.get("floor")
      ? parseInt(formData.get("floor") as string)
      : null;

    // Обрабатываем удобства
    const amenities: string[] = [];
    formData.getAll("amenities").forEach((item) => {
      if (typeof item === "string") {
        amenities.push(item);
      }
    });

    // Обрабатываем изображения (пока сохраняем как массив путей)
    const images: string[] = []; // Здесь будет логика загрузки файлов

    // Создаем квартиру со статусом PENDING
    const apartment = await prisma.apartment.create({
      data: {
        title,
        description,
        price,
        type,
        district,
        address,
        rooms,
        area,
        floor,
        amenities,
        images,
        hostId: userId,
        status: "PENDING", // Важно: статус модерации
        isPublished: false, // Не публикуем до модерации
      },
    });

    // TODO: Отправка уведомления в Telegram о новой заявке

    return NextResponse.json({
      success: true,
      message: "Объявление отправлено на модерацию",
      apartment,
    });
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json(
      { error: "Ошибка при создании объявления" },
      { status: 500 }
    );
  }
}
