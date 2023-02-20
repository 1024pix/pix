const TABLE_NAME = 'users';
const OUTDATED_COLUMN_NAME = 'hasSeenNewProfileInfo';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(OUTDATED_COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(OUTDATED_COLUMN_NAME).notNullable().defaultTo(true);
  });
};
