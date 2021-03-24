const TABLE_NAME = 'assessments';
const TYPE_COLUMN = 'state';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropIndex(TYPE_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.index(TYPE_COLUMN);
  });
};
