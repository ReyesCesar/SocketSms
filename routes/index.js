import express from "express";
import db from "../database.js";
import { io } from "../server.js";
import { logAudit } from "../Utils/logger.js";

const router = express.Router();

function broadcastError(message) {
  io.emit("message", { msg: message });
  console.log(`⚠️ Error enviado a todos: ${message}`);
}

/* ======================================================
   📱 PHONENUMBER
====================================================== */

router.post("/save", async (req, res) => {
  try {
    const { phone_number, description, isBlocked, isDisconnected, isMoney, imei } = req.body;
    if (!phone_number || !imei) return res.status(400).json({ error: "Faltan datos obligatorios" });
    await db("phone_number_list").insert({
      phone_number, description,
      is_blocked: isBlocked,
      is_disconnected: isDisconnected,
      is_money: isMoney,
      imei
    });
    res.send("OK");
  } catch (error) {
    console.error("Error en POST /save:", error);
    await logAudit("/phonenumber/save", error.message, JSON.stringify(req.body));
    broadcastError(error.message);
    res.status(500).send("Error");
  }
});

router.get("/phonenumber/get", async (req, res) => {
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

router.put("/phonenumber/edit", async (req, res) => {
  try {
    const { id, phone_number, description, isBlocked, isDisconnected, isMoney, imei } = req.body;
    await db("phone_number_list").where({ id }).update({
      phone_number, description,
      is_blocked: isBlocked,
      is_disconnected: isDisconnected,
      is_money: isMoney,
      imei,
    });
    res.send("OK");
  } catch (e) {
    console.error("Error en PUT /phonenumber/edit:", e.message);
    await logAudit("/phonenumber/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

router.delete("/phonenumber/delete", async (req, res) => {
  try {
    const { imei, id } = req.query;
    await db("phone_number_list").where({ imei, id }).del();
    res.status(200).send("200");
  } catch (e) {
    await logAudit("/phonenumber/delete", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   🧠 PHONENAME
====================================================== */

router.post("/phonename/save", async (req, res) => {
  try {
    const { imei, name } = req.body;
    if (!imei || !name) return res.status(400).send("Error");
    await db("imei_name").insert({ imei, name });
    res.send("200");
  } catch (e) {
    await logAudit("/phonename/save", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(400).send("210");
  }
});

router.get("/phonename/get", async (req, res) => {
  try {
    const { imei } = req.query;
    const rows = await db("imei_name").where({ socket_identifier: imei });
    if (!rows.length) {
      console.log(`No se encontraron registros para socket_identifier: ${imei}`);
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

router.put("/phonename/edit", async (req, res) => {
  try {
    const { imei, name } = req.body;
    const updated = await db("imei_name").where({ imei }).update({ name });
    if (updated) res.send("200");
    else res.status(400).send("Activo");
  } catch (e) {
    await logAudit("/phonename/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   ⏱️ TIMER
====================================================== */

router.post("/timer/save", async (req, res) => {
  try {
    const { imei, date } = req.body;
    await db("timer").insert({ imei, date });
    res.send("OK");
  } catch (e) {
    console.error("Error en POST /timer/save:", e.message);
    await logAudit("/timer/save", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

router.get("/timer/get", async (req, res) => {
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

router.put("/timer/edit", async (req, res) => {
  try {
    const { id, imei, date } = req.body;
    await db("timer").where({ id, imei }).update({ date });
    res.send("OK");
  } catch (e) {
    await logAudit("/timer/edit", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   🔢 COUNTER
====================================================== */

router.post("/counter", async (req, res) => {
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

router.get("/counter/get", async (req, res) => {
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

router.put("/counter/:id", async (req, res) => {
  try {
    const { counter } = req.body;
    const { id } = req.params;
    await db("counter").where({ id }).update({ counter });
    res.json({ message: "Actualizado" });
  } catch (e) {
    await logAudit("/counter/getid", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

router.delete("/counter/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db("counter").where({ id }).del();
    res.json({ message: "Eliminado" });
  } catch (e) {
    await logAudit("/counter/delete", e.message, JSON.stringify(req.body));
    broadcastError(e.message);
    res.status(500).send("Error");
  }
});

/* ======================================================
   📤 SEND
====================================================== */

router.post("/send", async (req, res) => {
  try {
    const { msg, name } = req.body;
    const imeiRecord = await db("imei_name").where({ name }).first();
    if (!imeiRecord) return res.status(404).json({ error: "Socket no encontrado para ese IMEI" });
    const payload = `${msg},${imeiRecord.socket_identifier}`;
    io.emit("message", payload);
    res.sendStatus(204);
  } catch (e) {
    console.error("error en /send:", e);
    broadcastError(e.message);
    res.status(500).json({ status: "Error" });
  }
});

export default router;