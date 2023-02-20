const TABLE_NAME = 'users';
const COLUMN_NAME = 'hasSeenAssessmentInstructions';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
