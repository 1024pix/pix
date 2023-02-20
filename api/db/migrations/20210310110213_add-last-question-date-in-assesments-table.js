const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'lastQuestionDate';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
