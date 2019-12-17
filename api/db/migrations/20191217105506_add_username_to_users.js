const TABLE_NAME = 'users';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('username').unique();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('username');
  });
};
