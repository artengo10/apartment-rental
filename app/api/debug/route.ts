import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Тест подключения к базе
    const testQuery = await prisma.$queryRaw`SELECT 1 as result`;

    // Проверим существующие таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    // Проверим таблицу users
    const userCount = await prisma.user.count();

    return NextResponse.json({
      database: {
        connected: true,
        testQuery: testQuery,
        tables: tables,
        userCount: userCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlLength: process.env.DATABASE_URL?.length,
        },
      },
      { status: 500 }
    );
  }
}
