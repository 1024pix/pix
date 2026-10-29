const TABLE_NAME = 'lti_platforms';
const OLD_COLUMN_NAME = 'origin';
const NEW_COLUMN_NAME = 'issuer';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  });
}
