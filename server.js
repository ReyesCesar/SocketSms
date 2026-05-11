import express from "express";
import http from "http";
import { Server } from "socket.io";
import router from "./routes/index.js";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);
  socket.emit("message", { from: "server", text: "¡Bienvenido!" });

  socket.on("message", (data) => {
    console.log("📩 Mensaje recibido del cliente:", data);
    io.emit("message", { from: socket.id, text: data });
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

app.use(express.json());
app.use("/", router);

const PORT = 3030;
server.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));