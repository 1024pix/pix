const TABLE_NAME = 'certification-candidates';
const SESSION_ID_COLUMN = 'sessionId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(SESSION_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(SESSION_ID_COLUMN);
  });
};
