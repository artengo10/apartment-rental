import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// Функция для загрузки изображения на imgBB (дублируем из app/api/apartments/route.ts)
async function uploadToImgBB(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

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
        isEdited: true,
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
      images: apartment.images, // images
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

// PATCH - обновить объявление (с отправкой на повторную модерацию)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const apartmentId = parseInt(params.id);
    if (isNaN(apartmentId)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    // Проверяем, существует ли объявление и принадлежит ли пользователю
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!existingApartment) {
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      );
    }

    // Проверяем права доступа
    if (existingApartment.hostId !== userId) {
      return NextResponse.json(
        { error: "Нет прав на редактирование этого объявления" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Извлекаем данные
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price")
      ? parseInt(formData.get("price") as string)
      : null;
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

    // Валидация
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
        { error: "Все обязательные поля должны быть заполнены" },
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

    // Получаем старые изображения (если были переданы)
    const existingImages: string[] = [];
    formData.getAll("existingImages").forEach((item) => {
      if (typeof item === "string") {
        existingImages.push(item);
      }
    });

    // Обрабатываем новые изображения
    const imageFiles = formData.getAll("images") as File[];
    const newImages: string[] = [];

    // Загружаем новые изображения на imgBB
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        try {
          if (file.size > 10 * 1024 * 1024) {
            console.warn(`File ${file.name} is too large, skipping`);
            continue;
          }

          const imageUrl = await uploadToImgBB(file);
          if (imageUrl) {
            newImages.push(imageUrl);
          }
        } catch (error) {
          console.error("Error uploading image to imgBB:", error);
        }
      }
    }

    // Объединяем старые и новые изображения
    const allImages = [...existingImages, ...newImages];

    // Проверяем, что есть хотя бы одно изображение
    if (allImages.length === 0) {
      return NextResponse.json(
        { error: "Добавьте хотя бы одно изображение" },
        { status: 400 }
      );
    }

    // Обновляем объявление и меняем статус на PENDING для повторной модерации
    // Отмечаем, что объявление было отредактировано
    const updatedApartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        title,
        description,
        price,
        type,
        district,
        address,
        lat,
        lng,
        rooms,
        area,
        floor,
        amenities,
        images: allImages,
        status: "PENDING", // Отправляем на повторную модерацию
        isPublished: false, // Снимаем с публикации
        isEdited: true, // ← ЗДЕСЬ ставим true!
        rejectionReason: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Объявление обновлено и отправлено на модерацию",
      apartment: {
        id: updatedApartment.id,
        title: updatedApartment.title,
        status: updatedApartment.status,
      },
    });
  } catch (error) {
    console.error("Error updating apartment:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении объявления" },
      { status: 500 }
    );
  }
}

// DELETE - удалить объявление
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const apartmentId = parseInt(params.id);

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Объявление не найдено" },
        { status: 404 }
      );
    }

    if (apartment.hostId !== userId) {
      return NextResponse.json(
        { error: "Нет прав на удаление этого объявления" },
        { status: 403 }
      );
    }

    await prisma.apartment.delete({
      where: { id: apartmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Объявление удалено",
    });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении объявления" },
      { status: 500 }
    );
  }
}
