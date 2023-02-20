const TABLE_NAME = 'badges';
const TITLE_COLUMN = 'title';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(TITLE_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};
