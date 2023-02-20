const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'assessmentMethod';
const DEFAULT_COLUMN_VALUE = 'SMART_RANDOM';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(COLUMN_NAME).defaultTo(DEFAULT_COLUMN_VALUE);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
