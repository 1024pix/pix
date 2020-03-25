const TABLE_NAME = 'knowledge-elements';
const COLUMN_NAME = 'answerId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(COLUMN_NAME);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(COLUMN_NAME);
  });
};
