const TABLE_NAME = 'assessments';
const TYPE_COLUMN = 'type';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(TYPE_COLUMN);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(TYPE_COLUMN);
  });
};
