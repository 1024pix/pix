const TABLE_NAME = 'user-campaign-surveys';
const COLUMN_NAME = 'satisfactionScore';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.smallint('satisfactionScore').notNullable().comment('satisfaction score from 1 to 5');
  });
}
