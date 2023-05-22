const TABLE_NAME = 'memberships';
const DISABLED_AT_COLUMN = 'disabledAt';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(DISABLED_AT_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(DISABLED_AT_COLUMN);
  });
};

export { up, down };
