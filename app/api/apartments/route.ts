import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// GET - получить все ОДОБРЕННЫЕ объявления для главной страницы
export async function GET(request: NextRequest) {
  try {
    const apartments = await prisma.apartment.findMany({
      where: {
        status: "APPROVED",
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

    // Преобразуем данные в формат, ожидаемый фронтендом
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
      images: apartment.images || [], // УБЕДИТЕСЬ что это поле передается как массив
      amenities: apartment.amenities,
      hostName: apartment.host.name,
      hostId: apartment.hostId,
      hostRating: 4.5,
    }));

    return NextResponse.json(transformedApartments);
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
    const lat = formData.get("lat")
      ? parseFloat(formData.get("lat") as string)
      : null;
    const lng = formData.get("lng")
      ? parseFloat(formData.get("lng") as string)
      : null;
    const rooms = formData.get("rooms")
      ? parseInt(formData.get("rooms") as string)
      : null;
    const area = formData.get("area")
      ? parseInt(formData.get("area") as string)
      : null;
    const floor = formData.get("floor")
      ? parseInt(formData.get("floor") as string)
      : null;

    // Валидация (ОБНОВЛЕНО - проверяем координаты)
    if (
      !title ||
      !description ||
      !price ||
      !type ||
      !district ||
      !address ||
      !lat ||
      !lng
    ) {
      return NextResponse.json(
        {
          error:
            "Все обязательные поля должны быть заполнены, включая корректный адрес с координатами",
        },
        { status: 400 }
      );
    }

    // Обрабатываем удобства
    const amenities: string[] = [];
    formData.getAll("amenities").forEach((item) => {
      if (typeof item === "string") {
        amenities.push(item);
      }
    });

    // Обрабатываем изображения - загружаем на imgBB и получаем ссылки
    const imageFiles = formData.getAll("images") as File[];
    const images: string[] = [];

    // Загружаем каждое изображение на imgBB
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        try {
          // Проверяем размер файла (максимум 10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.warn(`File ${file.name} is too large, skipping`);
            continue;
          }

          const imageUrl = await uploadToImgBB(file);
          if (imageUrl) {
            images.push(imageUrl);
          }
        } catch (error) {
          console.error("Error uploading image to imgBB:", error);
          // Продолжаем даже если одно изображение не загрузилось
        }
      }
    }

    // Проверяем, что есть хотя бы одно изображение
    if (images.length === 0) {
      return NextResponse.json(
        { error: "Добавьте хотя бы одно изображение" },
        { status: 400 }
      );
    }

    // Создаем квартиру со статусом PENDING
    const apartment = await prisma.apartment.create({
      data: {
        title,
        description,
        price,
        type,
        district,
        address,
        lat, // ДОБАВЛЕНО
        lng, // ДОБАВЛЕНО
        rooms,
        area,
        floor,
        amenities,
        images,
        hostId: userId,
        status: "PENDING",
        isPublished: false,
        isEdited: false,
      },
    });

    // TODO: Отправка уведомления в Telegram о новой заявке

    return NextResponse.json({
      success: true,
      message: "Объявление отправлено на модерацию",
      apartment: {
        id: apartment.id,
        title: apartment.title,
        status: apartment.status,
      },
    });
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json(
      { error: "Ошибка при создании объявления" },
      { status: 500 }
    );
  }
}

// Функция для загрузки изображения на imgBB
async function uploadToImgBB(file: File): Promise<string> {
  // Конвертируем файл в base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  // Создаем FormData для отправки на imgBB
  const formData = new FormData();
  formData.append("image", base64Image);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=27bbb71a6392846bef0e3f191e0568a7`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("ImgBB upload failed");
  }

  return data.data.url;
}
