const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'assignedUserId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).references('users.id');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
