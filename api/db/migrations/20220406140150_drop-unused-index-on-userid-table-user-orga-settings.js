const TABLE_NAME = 'user-orga-settings';
const USERID_COLUMN = 'userId';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(USERID_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.index(USERID_COLUMN);
  });
};

export { up, down };
