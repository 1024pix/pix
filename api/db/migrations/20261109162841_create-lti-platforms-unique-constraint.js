const TABLE_NAME = 'lti_platforms';
const COLUMN_NAME = 'issuer';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.unique([COLUMN_NAME]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropUniqueIfExists([COLUMN_NAME]);
  });
}
