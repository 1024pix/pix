const TABLE_NAME = 'certification_versions_tubes';
const TUBE_VERSION_ID_COLUMN_NAME = 'tube_id';
const VERSION_ID_COLUMN_NAME = 'version_id';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string(TUBE_VERSION_ID_COLUMN_NAME).comment('Tube identifier');
    table.integer(VERSION_ID_COLUMN_NAME).references('certification_versions.id').comment('Version identifier');
    table.primary([VERSION_ID_COLUMN_NAME, TUBE_VERSION_ID_COLUMN_NAME]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
