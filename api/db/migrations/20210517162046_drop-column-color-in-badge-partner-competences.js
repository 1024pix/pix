const TABLE_NAME = 'badge-partner-competences';
const COLUMN_NAME = 'color';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};
