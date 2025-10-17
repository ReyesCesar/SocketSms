// Utils/logger.js
import db from "../database.js";

/**
 * Guarda un error en la tabla audit_log
 * @param {string} endpoint - Ruta donde ocurrió el error
 * @param {string} message - Mensaje del error
 * @param {string} data - Datos enviados (body o query)
 * @param {string} method - Método HTTP (opcional)
 */
export async function logAudit(endpoint, message, data = "", method = "UNKNOWN") {
  try {
    await db("audit_log").insert({
      endpoint,
      method,
      message,
    });
    console.log(`🧾 Error registrado en audit_log: [${endpoint}] ${message}`);
  } catch (err) {
    console.error("❌ Error al guardar en audit_log:", err.message);
  }
}
