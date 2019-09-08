const TABLE_NAME = 'answers';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('timeout');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('timeout');
  });
};
