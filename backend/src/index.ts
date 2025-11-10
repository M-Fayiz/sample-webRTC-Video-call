import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

dotenv.config();
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

type RoomUsers = { [roomId: string]: Set<string> };
const roomUsers: RoomUsers = {};

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join", (roomId: string) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
    roomUsers[roomId].add(socket.id);

    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("peer-joined", socket.id);
  });

  const leaveAll = () => {
    for (const roomId of socket.rooms) {
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        socket.to(roomId).emit("peer-left", socket.id);

        if (roomUsers[roomId].size === 0) {
          delete roomUsers[roomId];
        }
      }
    }
  };

  socket.on("disconnecting", leaveAll);
  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
    leaveAll();
  });

  socket.on("offer", ({ roomId, sdp, from }) => {
    socket.to(roomId).emit("offer", { sdp, from });
  });

  socket.on("answer", ({ roomId, sdp, from }) => {
    socket.to(roomId).emit("answer", { sdp, from });
  });

  socket.on("ice-candidate", ({ roomId, candidate, from }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, from });
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 Signaling server running on port ${port}`);
});
