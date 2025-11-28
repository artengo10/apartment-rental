"use client";

import { useEffect, useState } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com"
        : "http://localhost:3001";

    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) return;

    console.log("🔌 Connecting to socket...", socketUrl);

    import("socket.io-client").then((module) => {
      const socketInstance = module.default(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected");
        setIsConnected(true);
        setSocket(socketInstance);
      });

      socketInstance.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error: Error) => {
        console.error("❌ Socket connection error:", error);
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
};
