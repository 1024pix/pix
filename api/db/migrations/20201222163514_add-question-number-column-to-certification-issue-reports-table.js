const TABLE_NAME = 'certification-issue-reports';
const COLUMN_NAME = 'questionNumber';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).unsigned();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
