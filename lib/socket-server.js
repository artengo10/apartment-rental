// lib/socket-server.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Импортируем Prisma правильно для CommonJS
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const connectedUsers = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.userId;
      socket.data.userName = decoded.name || "User";
      next();
    } catch (error) {
      console.log("❌ Socket auth error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User ${userId} connected`);

    connectedUsers.set(userId, socket.id);

    // При подключении присоединяем пользователя ко всем его чатам
    try {
      const userChats = await prisma.chat.findMany({
        where: {
          OR: [{ tenantId: userId }, { hostId: userId }],
        },
        select: { id: true },
      });

      userChats.forEach((chat) => {
        socket.join(`chat_${chat.id}`);
        console.log(`👤 User ${userId} joined chat ${chat.id}`);
      });
    } catch (error) {
      console.error("Error joining chats:", error);
    }

    socket.on("send-message", async (data) => {
      try {
        const { chatId, content } = data;
        const userId = socket.data.userId;

        console.log(
          `💬 User ${userId} sending message to chat ${chatId}: ${content}`
        );

        // Проверяем доступ к чату
        const chat = await prisma.chat.findFirst({
          where: {
            id: parseInt(chatId),
            OR: [{ tenantId: userId }, { hostId: userId }],
          },
        });

        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // СОХРАНЯЕМ СООБЩЕНИЕ В POSTGRESQL ЧЕРЕЗ PRISMA
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: userId,
            chatId: parseInt(chatId),
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Обновляем время последнего сообщения в чате
        await prisma.chat.update({
          where: { id: parseInt(chatId) },
          data: { updatedAt: new Date() },
        });

        // Отправляем сообщение всем участникам чата
        io.to(`chat_${chatId}`).emit("new-message", message);

        console.log(
          `✅ Message saved to database and delivered to chat ${chatId}`
        );
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Error sending message" });
      }
    });

    socket.on("typing-start", async (data) => {
      const { chatId } = data;
      const userId = socket.data.userId;

      console.log(`✍️ User ${userId} typing in chat ${chatId}`);

      socket.to(`chat_${chatId}`).emit("user-typing", {
        userId: userId,
        chatId: chatId,
        isTyping: true,
      });
    });

    socket.on("typing-stop", async (data) => {
      const { chatId } = data;
      const userId = socket.data.userId;

      socket.to(`chat_${chatId}`).emit("user-typing", {
        userId: userId,
        chatId: chatId,
        isTyping: false,
      });
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      console.log(`🔌 User ${userId} disconnected`);
    });
  });

  return io;
}

function getUserSocket(userId) {
  return connectedUsers.get(userId);
}

module.exports = { initializeSocket, getUserSocket };
