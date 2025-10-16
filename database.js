import knex from "knex";

// Configuración de Knex para SQLite
const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./sms.db", // nombre del archivo SQLite
  },
  useNullAsDefault: true,  // obligatorio para SQLite
  pool: {
    afterCreate: (conn, done) => {
      // habilita claves foráneas en SQLite
      conn.run("PRAGMA foreign_keys = ON", done);
    },
  },
  migrations: {
    directory: "./migrations", // carpeta donde estarán tus migraciones
  },
});

export default db;