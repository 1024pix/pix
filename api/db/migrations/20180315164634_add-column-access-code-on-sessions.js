const TABLE_NAME = 'sessions';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('accessCode');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('accessCode');
  });
};
