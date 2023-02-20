const TABLE_NAME = 'certification-candidates';
const FIRST_COLUMN_NAME = 'examinerComment';
const SECOND_COLUMN_NAME = 'hasSeenEndTestScreen';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(FIRST_COLUMN_NAME);
    table.dropColumn(SECOND_COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(FIRST_COLUMN_NAME);
    table.string(SECOND_COLUMN_NAME);
  });
};
