import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Функция для отправки уведомления в Telegram - ОСТАВЛЯЕМ ТОЛЬКО ЭТО ОБЪЯВЛЕНИЕ
async function sendToTelegram(
  apartment: any,
  userName: string,
  userPhone: string
) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log("Telegram credentials not configured");
    return;
  }

  const message = `
🏠 НОВОЕ ОБЪЯВЛЕНИЕ НА МОДЕРАЦИЮ

📝 Заголовок: ${apartment.title}
👤 Пользователь: ${userName}
📞 Телефон: ${userPhone}
💰 Цена: ${apartment.price} ₽/сутки
🏘️ Район: ${apartment.district}
📍 Адрес: ${apartment.address}
🏠 Тип: ${apartment.type}
${apartment.rooms ? `🚪 Комнат: ${apartment.rooms}` : ""}
${apartment.area ? `📐 Площадь: ${apartment.area} м²` : ""}
${apartment.floor ? `🏢 Этаж: ${apartment.floor}` : ""}

📋 Описание:
${apartment.description}

🖼️ Фото: ${apartment.images.length} шт.
⏰ Дата подачи: ${new Date().toLocaleString("ru-RU")}

✅ Требуется модерация!
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    console.log("Telegram response:", result);

    if (!result.ok) {
      console.error("Telegram API error:", result);
    }
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию - используем JWT токен
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    console.log("Received token:", token); // Для отладки

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    let userId: number;

    try {
      // Декодируем JWT токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log("Decoded JWT:", decoded); // Для отладки
      userId = decoded.userId;
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);

      // Если JWT не прошел проверку, пробуем старый метод (числовой ID)
      const numericUserId = parseInt(token);
      if (isNaN(numericUserId)) {
        return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
      }
      userId = numericUserId;
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Загружаем изображения на ImgBB
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImageUrls: string[] = [];

    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");

      const uploadFormData = new FormData();
      uploadFormData.append("image", base64Image);

      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const imgbbResult = await imgbbResponse.json();

      if (imgbbResult.success) {
        uploadedImageUrls.push(imgbbResult.data.url);
      } else {
        console.error("ImgBB upload failed:", imgbbResult);
      }
    }

    // Создаем квартиру
    const apartment = await prisma.apartment.create({
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseInt(formData.get("price") as string),
        type: formData.get("type") as "APARTMENT" | "HOUSE" | "STUDIO",
        district: formData.get("district") as string,
        address: formData.get("address") as string,
        rooms: formData.get("rooms")
          ? parseInt(formData.get("rooms") as string)
          : null,
        area: formData.get("area")
          ? parseInt(formData.get("area") as string)
          : null,
        floor: formData.get("floor")
          ? parseInt(formData.get("floor") as string)
          : null,
        amenities: formData.getAll("amenities") as string[],
        images: uploadedImageUrls,
        hostId: userId,
        isPublished: false, // На модерации
      },
    });

    // ⭐⭐⭐ ВОТ ЗДЕСЬ ВЫЗЫВАЕМ ФУНКЦИЮ sendToTelegram ⭐⭐⭐
    await sendToTelegram(apartment, user.name, user.phone);

    return NextResponse.json(
      {
        message: "Объявление отправлено на модерацию",
        apartment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE APARTMENT ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при создании объявления" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apartments = await prisma.apartment.findMany({
      where: {
        isPublished: true,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("GET APARTMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке объявлений" },
      { status: 500 }
    );
  }
}
