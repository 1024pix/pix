const TABLE_NAME = 'certification_versions';
const COLUMN_NAME = 'externalCalibrationId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(COLUMN_NAME)
      .defaultTo(null)
      .comment('External identifier for a record in data_calibrations table (data)');
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
