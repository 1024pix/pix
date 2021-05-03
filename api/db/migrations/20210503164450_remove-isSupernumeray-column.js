const TABLE_NAME = 'schooling-registrations';
const COLUMN = 'isSupernumerary';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.boolean(COLUMN);
  });
};
