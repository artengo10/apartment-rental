import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apartmentId, tenantId, hostId } = body;

    if (!apartmentId || !tenantId || !hostId) {
      return NextResponse.json(
        { error: "Не все параметры переданы" },
        { status: 400 }
      );
    }

    // Ищем существующий чат
    let chat = await prisma.chat.findFirst({
      where: {
        apartmentId: parseInt(apartmentId),
        tenantId: parseInt(tenantId),
        hostId: parseInt(hostId),
      },
    });

    // Если чата нет, создаем новый
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          apartmentId: parseInt(apartmentId),
          tenantId: parseInt(tenantId),
          hostId: parseInt(hostId),
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Ошибка проверки чата:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
