const TABLE_NAME = 'certification-center-memberships';
const COLUMN_NAME = 'isReferer';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).defaultTo(false);
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
