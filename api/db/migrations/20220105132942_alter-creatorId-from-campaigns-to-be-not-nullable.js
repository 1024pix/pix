const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'creatorId';

export const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).nullable().alter();
  });
};
