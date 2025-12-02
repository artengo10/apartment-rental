import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

// Используем any для простоты, или установите @types/socket.io-client
interface UseSocketReturn {
  socket: any;
  isConnected: boolean;
  sendMessage: (message: any) => void;
  sendTyping: (isTyping: boolean) => void;
  typingUsers: string[];
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    // Создаем соединение
    const socketInstance = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Слушаем события печатания
    socketInstance.on(
      "user_typing",
      (data: { userId: string; isTyping: boolean }) => {
        setTypingUsers((prev) => {
          if (data.isTyping && !prev.includes(data.userId)) {
            return [...prev, data.userId];
          } else if (!data.isTyping) {
            return prev.filter((id) => id !== data.userId);
          }
          return prev;
        });
      }
    );

    setSocket(socketInstance);

    // Очистка при размонтировании
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && isConnected) {
        socket.emit("send_message", message);
      }
    },
    [socket, isConnected]
  );

  // Отправка статуса печатания
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socket && isConnected) {
        socket.emit("typing", { isTyping });
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
    typingUsers,
  };
};
