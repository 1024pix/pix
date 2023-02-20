const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'documentationUrl';

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
