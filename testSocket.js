import { io } from "socket.io-client";

// Conexión al servidor raíz (sin namespace)
const socket = io("http://66.179.243.189:3030", {
  transports: ["websocket"], // 👈 fuerza WebSocket, igual que Flutter
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);

  // Puedes avisar al servidor que te conectaste (opcional)
  socket.emit("message", { msg: "Cliente Node conectado con éxito" });
});

// Escucha el canal 'message' (igual que Flutter)
socket.on("message", (data) => {
  console.log("📨 [CANAL: message] Mensaje recibido:", data);
});

// Manejo de desconexión
socket.on("disconnect", (reason) => {
  console.log("❌ Desconectado del servidor. Razón:", reason);
});

// Manejo de errores globales (por si el backend los emite con io.emit("error", {...}))
socket.on("error", (err) => {
  console.error("⚠️ Error recibido desde servidor:", err);
});

// Mantiene vivo el proceso
setInterval(() => {}, 1000 * 60 * 60);
