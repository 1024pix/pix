const TABLE_NAME = 'combined_courses';
const COLUMN_NAME = 'customLandingPageText';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .string(COLUMN_NAME)
      .defaultTo(null)
      .comment('Markdown text coming from prescriber displayed on combined course presentation page');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}
