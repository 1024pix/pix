const TABLE_NAME = 'users';
const COLUMN_NAME = 'disabled';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
