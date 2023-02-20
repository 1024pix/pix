const TABLE_NAME = 'answers';
const COLUMN_NAME = 'timeSpent';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
