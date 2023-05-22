const TABLE_NAME = 'target-profiles';
const OUTDATED_COLUMN_NAME = 'outdated';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(OUTDATED_COLUMN_NAME).notNullable().defaultTo(false);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(OUTDATED_COLUMN_NAME);
  });
};

export { up, down };
