const TABLE_NAME = 'badges';
const TITLE_COLUMN = 'title';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(TITLE_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};
