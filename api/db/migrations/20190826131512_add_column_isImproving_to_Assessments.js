const TABLE_NAME = 'assessments';
const COLUMN_NAME = 'isImproving';

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
