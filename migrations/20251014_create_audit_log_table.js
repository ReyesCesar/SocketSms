// 20251014_create_audit_log_table.js
/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("audit_log", (table) => {
    table.increments("id").primary();
    table.string("endpoint").notNullable();
    table.string("method").notNullable();
    table.text("message").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTable("audit_log");
}
