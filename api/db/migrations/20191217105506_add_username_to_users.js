const TABLE_NAME = 'users';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('username').unique();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('username');
  });
};
