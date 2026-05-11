import express from "express";
import http from "http";
import { Server } from "socket.io";
import router from "./routes/index.js";

const app = express();
const server = http.createServer(app); // 👈 necesario para socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use("/", router);

// Exporta io para usarlo en tus rutas si lo necesitas
export { io };

const PORT = 3030;
server.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));