const TABLE_NAME = 'organizations';
const COLUMN = 'canCollectProfiles';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.boolean(COLUMN).notNullable().defaultTo(false);
  });
};
