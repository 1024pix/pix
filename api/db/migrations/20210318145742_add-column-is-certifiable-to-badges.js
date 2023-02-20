const TABLE_NAME = 'badges';
const COLUMN_NAME = 'isCertifiable';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
