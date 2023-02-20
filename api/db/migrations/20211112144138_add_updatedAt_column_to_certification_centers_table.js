const TABLE_NAME = 'certification-centers';
const UPDATED_AT_COLUMN = 'updatedAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(UPDATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
  });
};
