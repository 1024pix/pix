const TABLE_NAME = 'target-profiles';
const COLUMN_NAME = 'description';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
