const TABLE_NAME = 'certification-courses';
const COLUMN_NAME = 'abortReason';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text(COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
