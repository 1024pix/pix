const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'archivedAt';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(COLUMN_NAME).nullable();
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
