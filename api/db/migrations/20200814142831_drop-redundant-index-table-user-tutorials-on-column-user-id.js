const TABLE_NAME = 'user_tutorials';
const USER_ID_COLUMN = 'userId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(USER_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(USER_ID_COLUMN);
  });
};
