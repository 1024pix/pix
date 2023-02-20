const TABLE_NAME = 'answers';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('timeout');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('timeout');
  });
};
