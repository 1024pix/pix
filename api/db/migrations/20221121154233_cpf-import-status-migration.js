const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'cpfImportStatus';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
