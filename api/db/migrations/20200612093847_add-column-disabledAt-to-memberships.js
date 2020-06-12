const TABLE_NAME = 'memberships';
const DISABLED_AT_COLUMN = 'disabledAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(DISABLED_AT_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(DISABLED_AT_COLUMN);
  });
};
