const TABLE_NAME = 'answers';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('elapsedTime');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('elapsedTime');
  });
};
