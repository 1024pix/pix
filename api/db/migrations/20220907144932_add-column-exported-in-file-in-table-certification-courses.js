const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'cpfFilename';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
