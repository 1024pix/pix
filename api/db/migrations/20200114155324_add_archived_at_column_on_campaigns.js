const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'archivedAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(COLUMN_NAME).nullable();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
