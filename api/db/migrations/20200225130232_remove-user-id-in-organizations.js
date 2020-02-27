const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'userId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer(COLUMN_NAME).unsigned();
  });
};
