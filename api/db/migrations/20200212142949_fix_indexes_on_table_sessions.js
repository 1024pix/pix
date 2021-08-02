const TABLE_NAME = 'sessions';
const ACCESS_CODE_COLUMN = 'accessCode';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ACCESS_CODE_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ACCESS_CODE_COLUMN);
  });
};
