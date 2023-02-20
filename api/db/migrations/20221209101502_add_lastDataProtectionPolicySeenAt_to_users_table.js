const TABLE_NAME = 'users';
const COLUMN_NAME = 'lastDataProtectionPolicySeenAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
