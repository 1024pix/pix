const TABLE_NAME = 'badge-criteria';
const COLUMN_NAME = 'cappedTubes';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
