const TABLE_NAME = 'users';
const COLUMN_NAME = 'lastDataProtectionPolicySeenAt';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
