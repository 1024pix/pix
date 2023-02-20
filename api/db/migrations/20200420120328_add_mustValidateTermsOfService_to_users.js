const TABLE_NAME = 'users';
const NEW_COLUMN = 'mustValidateTermsOfService';
const DEFAULT_VALUE = false;

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(NEW_COLUMN).notNullable().defaultTo(DEFAULT_VALUE);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(NEW_COLUMN);
  });
};
