const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'isManagingStudents';

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
