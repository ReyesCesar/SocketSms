import express from "express";
import db from "../database.js";
import http from "http";
import { Server } from "socket.io";
import { logAudit } from "../Utils/logger.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());

/*const nsp = io.of("/message");

nsp.on("connection", (socket) => {
  console.log("Cliente conectado al namespace /message:", socket.id);

  socket.emit("message", { from: "server", text: "¡Bienvenido!" });

  
  const sendRandomMessage = () => {
    const minutes = Math.floor(Math.random() * 3) + 1;
    const delay = minutes * 60 * 1000;

    setTimeout(() => {
      const randomText = `Mensaje aleatorio: ${Math.random().toString(36).substring(2, 8)}`;
      socket.emit("message", { from: "server", text: randomText });
      console.log(`📨 Enviado a ${socket.id}:`, randomText);
      sendRandomMessage();
    }, delay);
  };



  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});
*/
io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);

  // Bienvenida
  socket.emit("message", { from: "server", text: "¡Bienvenido!" });

  // Ejemplo de recibir mensajes del cliente Flutter
  socket.on("message", (data) => {
    console.log("📩 Mensaje recibido del cliente:", data);
    // Reenvía el mensaje a todos los clientes conectados
    io.emit("message", { from: socket.id, text: data });
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

const clients = new Map();

function sendToImei(imei, message) {
  const socketId = clients.get(imei); 
  if (socketId) {
    nsp.to(socketId).emit("message", { from: "server", text: message });
    console.log(`📨 Enviado a IMEI ${imei}: ${message}`);
  } else {
    console.warn(`⚠️ No hay cliente conectado con IMEI ${imei}`);
  }
}

/* ======================================================
   📱 PHONENUMBER
====================================================== */

// POST /phonenumber/save
app.post("/save", async (req, res) => {
  try {
    const { phone_number, description, isBlocked, isDisconnected, isMoney, imei } = req.body;

    if (!phone_number || !imei) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await db("phone_number_list").insert({
      phone_number,
      description,
      is_blocked: isBlocked,
      is_disconnected: isDisconnected,
      is_money: isMoney,
      imei
    });

    res.send("OK");
  } catch (error) {
    console.error("Error en POST /phonenumber/save:", error);
      await logAudit("/phonenumber/save", error.message, JSON.stringify(req.body));
      broadcastError(error.message);
    res.status(500).send("Error");
  }
});

// GET /phonenumber/get?imei=...
app.get("/phonenumber/get", async (req, res) => {
 try {
    const { imei } = req.query;
    const data = await db("phone_number_list").where({ imei });
    res.json(data);
  } catch (e) {
    console.error("Error en GET /phonenumber/get:", e.message);
      await logAudit("/phonenumber/get", e.message, JSON.stringify(req.body));
      broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// PUT /phonenumber/edit
app.put("/phonenumber/edit", async (req, res) => {
  try {
    const { id, phone_number, description, isBlocked, isDisconnected, isMoney, imei } = req.body;

    await db("phone_number_list")
      .where({ id })
      .update({
        phone_number,
        description,
        is_blocked: isBlocked,
        is_disconnected: isDisconnected,
        is_money: isMoney,
        imei,
      });

    res.send("OK");
  } catch (e) {
    console.error("Error en Put /phonenumber/edit:", e.message);
    await logAudit("/phonenumber/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// DELETE /phonenumber/delete?imei=...&id=...
app.delete("/phonenumber/delete", async (req, res) => {
  try {
    const { imei, id } = req.query;
    await db("phone_number_list").where({ imei, id }).del();
    res.status(200).send("200");
  } catch (e){
    await logAudit("/phonenumber/delete", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   🧠 PHONENAME
====================================================== */

// POST /phonename/save
app.post("/phonename/save", async (req, res) => {
  try {
    const { imei, name } = req.body;
    if (!imei || !name) return res.status(400).send("Error");
    await db("imei_name").insert({ imei, name });
    res.send("200");
  } catch (e){
    await logAudit("/phonename/save", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(400).send("210");
  }
});

// GET /phonename/get?imei=...
app.get("/phonename/get", async (req, res) => {
 try {
    const { imei } = req.query;
    const rows = await db("imei_name").where({ imei });

    if (!rows.length) {
      console.log(`No se encontraron registros para IMEI: ${imei}`);
      return res.status(400).send("400");
    }

    res.json(rows);
  } catch (e) {
    console.error("Error en GET /phonename/get:", e);
    await logAudit("/phonename/get", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Server");
  }
});

// PUT /phonename/edit
app.put("/phonename/edit", async (req, res) => {
  try {
    const { imei, name } = req.body;
    const updated = await db("imei_name").where({ imei }).update({ name });
    if (updated) res.send("200");
    else res.status(400).send("Activo");
  } catch (e){
    await logAudit("/phonename/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   ⏱️ TIMER
====================================================== */

// POST /timer/save
app.post("/timer/save", async (req, res) => {
   try {
    const { imei, date } = req.body;

    await db("timer").insert({
      imei,
      date
    });

    res.send("OK");
  } catch (e) {
    console.error("Error en POST /timer/save:", e.message);
    await logAudit("/timer/save", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// GET /timer/get?imei=...
app.get("/timer/get", async (req, res) => {
  try {
    const { imei } = req.query;
    const data = await db("timer").where({ imei });
    if (!data.length) return res.status(400).send("400");
    res.json(data);
  } catch (e) {
    await logAudit("/timer/get", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// PUT /timer/edit
app.put("/timer/edit", async (req, res) => {
  try {
    const { id, imei, date } = req.body;
    await db("timer").where({ id, imei }).update({ date });
    res.send("OK");
  } catch (e){
    await logAudit("/timer/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   🔢 COUNTER
====================================================== */

// POST /counter/
app.post("/counter", async (req, res) => {
  try {
    const { imei, counter } = req.body;
    const [id] = await db("counter").insert({ imei, counter });
    res.json({ id, imei, counter });
  } catch (e) {
    await logAudit("/counter/save", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// GET /counter/get?imei=...
app.get("/counter/get", async (req, res) => {
  try {
    const { imei } = req.query;
    const data = await db("counter").where({ imei });
    if (!data.length) return res.status(400).send("400");
    res.json(data);
  } catch (e) {
    await logAudit("/counter/get", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// PUT /counter/:id
app.put("/counter/:id", async (req, res) => {
  try {
    const { counter } = req.body;
    const { id } = req.params;
    await db("counter").where({ id }).update({ counter });
    res.json({ message: "Actualizado" });
  } catch (e){
    await logAudit("/counter/getid", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

// DELETE /counter/:id
app.delete("/counter/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db("counter").where({ id }).del();
    res.json({ message: "Eliminado" });
  } catch (e){
    await logAudit("/counter/delete", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});
/* ======================================================
   send
====================================================== */
app.post("/send", async (req, res) => {
  try {
    const { msg, name } = req.body;
    const record = await db("phone_number_list").where({ description: name }).first();
    if (!record) return res.status(404).json({ error: "Teléfono no encontrado" });

  const payload = `${msg},${record.imei}`; // => "123456789012345,6391098718,Prueba 2"

nsp.emit("message", { msg: payload });

    res.json({
      status: "ok",
      message: "Mensaje enviado a todos los clientes",
      data: { msg, name, imei: record.imei },
    });
  } catch (e) {
    console.error("error en /send:", e);
    broadcastError(e.message);
    res.status(500).json({ status: "Error" });
  }
});


function broadcastError(message) {
 nsp.emit("message", { msg: message });
  console.log(`⚠️ Error enviado a todos: ${message}`);
}

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

export default app;
