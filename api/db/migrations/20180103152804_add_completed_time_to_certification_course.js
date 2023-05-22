const TABLE_NAME = 'certification-courses';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime('completedAt');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('completedAt');
  });
};

export { up, down };
