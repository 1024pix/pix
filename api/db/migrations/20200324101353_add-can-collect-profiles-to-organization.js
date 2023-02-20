const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'canCollectProfiles';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
