const TABLE_NAME = 'campaign-participations';
const COLUMN_NAME = 'status';
const DEFAULT_COLUMN_VALUE = 'STARTED';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).defaultTo(DEFAULT_COLUMN_VALUE);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
