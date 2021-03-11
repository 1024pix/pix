const TABLE_NAME = 'answers';
const COLUMN_NAME = 'timeSpent';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
