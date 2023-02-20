const TABLE_NAME = 'pole-emploi-sendings';
const COLUMN_NAME = 'createdAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(COLUMN_NAME);
  });
};
