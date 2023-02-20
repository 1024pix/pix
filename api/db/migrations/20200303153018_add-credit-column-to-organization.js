const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'credit';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).defaultTo(0);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
