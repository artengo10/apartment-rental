import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Временное хранилище для состояния печатания (в продакшене используйте Redis)
const typingStates = new Map<number, { userId: number; expires: number }>();

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId, isTyping } = await request.json();
    const chatId = parseInt(params.chatId);

    if (isTyping) {
      // Сохраняем состояние печатания на 3 секунды
      typingStates.set(chatId, { 
        userId, 
        expires: Date.now() + 3000 
      });
    } else {
      typingStates.delete(chatId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Ошибка при обновлении состояния печатания:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении состояния печатания" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId);
    const typingState = typingStates.get(chatId);

    // Очищаем просроченные состояния
    if (typingState && typingState.expires < Date.now()) {
      typingStates.delete(chatId);
      return NextResponse.json({ isTyping: false });
    }

    return NextResponse.json({ 
      isTyping: !!typingState,
      userId: typingState?.userId 
    });
  } catch (error) {
    console.error("❌ Ошибка при получении состояния печатания:", error);
    return NextResponse.json(
      { error: "Ошибка при получении состояния печатания" },
      { status: 500 }
    );
  }
}