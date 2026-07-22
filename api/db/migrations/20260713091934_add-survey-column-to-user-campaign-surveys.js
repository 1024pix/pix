const TABLE_NAME = 'user-campaign-surveys';
const COLUMN_NAME = 'survey';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME).nullable().comment("Survey's answers");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, async function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}
