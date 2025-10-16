import db from './database.js'
async function checkTables() {
  try {
    const tables = await db.raw(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log("Tablas en sms.db:");
    tables.forEach((t) => console.log(" -", t.name));
    process.exit(0);
  } catch (err) {
    console.error("Error revisando la base de datos:", err);
    process.exit(1);
  }
}

checkTables();