const TABLE_NAME = 'answers';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('elapsedTime');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('elapsedTime');
  });
};

export { up, down };
