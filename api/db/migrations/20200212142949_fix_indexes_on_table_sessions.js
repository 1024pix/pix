const TABLE_NAME = 'sessions';
const ACCESSCODE_COLUMN = 'accessCode';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ACCESSCODE_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ACCESSCODE_COLUMN);
  });
};
