const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'resultsSentToPrescriberAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
