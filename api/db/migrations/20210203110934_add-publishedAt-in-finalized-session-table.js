const TABLE_NAME = 'finalized-sessions';
const COLUMN_NAME = 'publishedAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dateTime(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
