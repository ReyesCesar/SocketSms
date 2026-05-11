import { io } from "socket.io-client";

// Conexión al servidor raíz (sin namespace)
const socket = io("https://sms.desarrollomvp.com", {
  transports: ["polling", "websocket"], // 👈 polling primero para pasar a Cloudflare, luego sube a websocket
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor con ID:", socket.id);
  socket.emit("message", { msg: "Cliente Node conectado con éxito" });
});

socket.on("message", (data) => {
  console.log("📨 [CANAL: message] Mensaje recibido:", data);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Desconectado del servidor. Razón:", reason);
});

socket.on("error", (err) => {
  console.error("⚠️ Error recibido desde servidor:", err);
});

setInterval(() => {}, 1000 * 60 * 60);