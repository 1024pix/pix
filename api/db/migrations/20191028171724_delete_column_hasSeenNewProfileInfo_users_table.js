const TABLE_NAME = 'users';
const OUTDATED_COLUMN_NAME = 'hasSeenNewProfileInfo';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(OUTDATED_COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(OUTDATED_COLUMN_NAME).notNullable().defaultTo(true);
  });
};

export { up, down };
