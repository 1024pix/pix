const TABLE_NAME = 'certification-courses';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime('completedAt');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('completedAt');
  });
};
