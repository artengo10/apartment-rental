import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Проверка подключения к базе данных
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "success",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
        JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
        NODE_ENV: process.env.NODE_ENV,
      },
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
          JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
          NODE_ENV: process.env.NODE_ENV,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
