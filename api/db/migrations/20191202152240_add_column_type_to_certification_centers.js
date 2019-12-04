const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'type';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.enu(COLUMN_NAME, ['SCO', 'SUP', 'PRO']);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
