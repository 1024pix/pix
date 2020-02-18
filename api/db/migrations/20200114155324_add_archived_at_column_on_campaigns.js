const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'archivedAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(COLUMN_NAME).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
