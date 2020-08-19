const TABLE_NAME = 'user_tutorials';
const USERID_COLUMN = 'userId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(USERID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(USERID_COLUMN);
  });
};
