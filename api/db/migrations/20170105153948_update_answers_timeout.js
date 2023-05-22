const TABLE_NAME = 'answers';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('timeout');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('timeout');
  });
};

export { up, down };
