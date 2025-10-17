import { io } from "socket.io-client";

const socket = io("http://66.179.243.189:3030", { reconnection: true });

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
});

socket.on("message", (data) => {
  console.log("📨 Mensaje recibido desde servidor:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor");
});

// Esto mantiene Node activo
setInterval(() => {}, 1000 * 60 * 60);
