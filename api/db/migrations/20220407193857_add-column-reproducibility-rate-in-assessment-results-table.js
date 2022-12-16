const TABLE_NAME = 'assessment-results';
const COLUMN_NAME = 'reproducibilityRate';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.decimal(COLUMN_NAME, 5, 2).defaultTo(null);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
