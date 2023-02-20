const TABLE_NAME = 'answers';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text('resultDetails');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('resultDetails');
  });
};
