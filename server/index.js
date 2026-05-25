import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import Chat from "./models/Chat.js";

dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();

// using middlewares
app.use(express.json());

const allowedOrigins = [
  process.env.frontendurl,
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy block: ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";

// using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api/chat", chatRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.frontendurl || "http://localhost:5174",
    credentials: true,
  }
});

const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, message } = data;
    // Save to DB
    const chat = new Chat({ sender, receiver, message });
    await chat.save();
    // Emit to receiver
    const receiverSocketId = userSocketMap.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        sender,
        receiver,
        message,
        createdAt: chat.createdAt
      });
    }
  });

  socket.on('typing', (data) => {
    const { sender, receiver } = data;
    const receiverSocketId = userSocketMap.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { sender });
    }
  });

  socket.on('stopTyping', (data) => {
    const { sender, receiver } = data;
    const receiverSocketId = userSocketMap.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping', { sender });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from map
    for (let [userId, socketId] of userSocketMap) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
