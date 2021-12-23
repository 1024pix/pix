const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'assessmentMethod';
const DEFAULT_COLUMN_VALUE = 'SMART_RANDOM';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(COLUMN_NAME).defaultTo(DEFAULT_COLUMN_VALUE);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
