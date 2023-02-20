const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'finalizedAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
