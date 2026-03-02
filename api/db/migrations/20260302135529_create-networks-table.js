const TABLE_NAME = 'networks';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.comment('This table contains all networks.');
    table.increments('id').primary();
    table.string('name', 50).notNullable().comment('Name of the network');
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
