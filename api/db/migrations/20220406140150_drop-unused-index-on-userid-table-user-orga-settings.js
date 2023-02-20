const TABLE_NAME = 'user-orga-settings';
const USERID_COLUMN = 'userId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(USERID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.index(USERID_COLUMN);
  });
};
