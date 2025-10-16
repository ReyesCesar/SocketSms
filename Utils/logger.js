// utils/logger.js
import db from "../database.js"

export async function logAudit(origen, mensaje, detalle = null, tipo = "ERROR") {
  try {
    await db("audit_log").insert({ origen, mensaje, detalle, tipo });
  } catch (e) {
    console.error("No se pudo guardar log en DB:", e.message);
  }
}
