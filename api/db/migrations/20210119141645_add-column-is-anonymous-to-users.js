const TABLE_NAME = 'users';
const COLUMN_NAME = 'isAnonymous';

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
