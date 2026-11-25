const TABLE_NAME = 'user_certification_results';
const COLUMN_NAME = 'userId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.setNullable(COLUMN_NAME);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropNullable(COLUMN_NAME);
  });
}
