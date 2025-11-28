import { NextRequest } from "next/server";
import { initializeSocket } from "@/lib/socket-server";

// Это нужно для инициализации Socket.IO в Next.js
// В реальном приложении это будет настроено в отдельном сервере
export async function GET(request: NextRequest) {
  return new Response("Socket.IO route");
}
