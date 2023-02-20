const TABLE_NAME = 'tutorial-evaluations';
const USERID_COLUMN = 'userId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(USERID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(USERID_COLUMN);
  });
};
