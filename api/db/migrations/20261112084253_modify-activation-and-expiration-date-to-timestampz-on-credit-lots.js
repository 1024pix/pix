const TABLE_NAME = 'credits_lots';
const ACTIVATION_COLUMN_NAME = 'activation_date';
const EXPIRATION_COLUMN_NAME = 'expiration_date';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.datetime(ACTIVATION_COLUMN_NAME).notNullable().alter();
    table.datetime(EXPIRATION_COLUMN_NAME).notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.date(ACTIVATION_COLUMN_NAME).notNullable().alter();
    table.date(EXPIRATION_COLUMN_NAME).notNullable().alter();
  });
}
