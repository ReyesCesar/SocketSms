// migrations/20251002221750_init_tables.js

exports.up = async function (knex) {
  // Tabla counter
  await knex.schema.createTable("counter", (table) => {
    table.increments("id").primary();
    table.string("imei", 255).notNullable();
    table.bigInteger("counter").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Tabla imei_name
  await knex.schema.createTable("imei_name", (table) => {
    table.increments("id").primary();
    table.string("imei", 255).notNullable();
    table.string("name", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.string("socket_identifier", 255);
  });

  // Tabla inspector
  await knex.schema.createTable("inspector", (table) => {
    table.string("inspector_id", 255).notNullable();
    table.string("socket_identifier", 255).notNullable();
  });

  // Tabla phone_number_list
  await knex.schema.createTable("phone_number_list", (table) => {
    table.increments("id").primary();
    table.string("phone_number", 255);
    table.string("imei", 255);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.string("description", 255);
    table.boolean("is_disconnected").defaultTo(false);
    table.boolean("is_blocked").defaultTo(false);
    table.boolean("is_money").defaultTo(false);
  });

  // Tabla timer
  await knex.schema.createTable("timer", (table) => {
    table.increments("id").primary();
    table.string("date", 255).notNullable();
    table.string("imei", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("timer");
  await knex.schema.dropTableIfExists("phone_number_list");
  await knex.schema.dropTableIfExists("inspector");
  await knex.schema.dropTableIfExists("imei_name");
  await knex.schema.dropTableIfExists("counter");
};
