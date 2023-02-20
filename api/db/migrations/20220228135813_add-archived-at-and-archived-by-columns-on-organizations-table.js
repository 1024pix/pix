const TABLE_NAME = 'organizations';
const ARCHIVED_AT = 'archivedAt';
const ARCHIVED_BY = 'archivedBy';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(ARCHIVED_AT).nullable();
    table.bigInteger(ARCHIVED_BY).nullable().references('users.id');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(ARCHIVED_AT);
    table.dropColumn(ARCHIVED_BY);
  });
};
