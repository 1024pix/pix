const TABLE_NAME = 'certification-challenges';
const COLUMN_NAME = 'hasBeenSkippedAutomatically';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
