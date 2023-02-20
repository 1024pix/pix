const TABLE_NAME = 'memberships';
const CREATED_AT_COLUMN = 'createdAt';
const UPDATED_AT_COLUMN = 'updatedAt';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(CREATED_AT_COLUMN);
    table.dateTime(UPDATED_AT_COLUMN);
  });
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dateTime(CREATED_AT_COLUMN).defaultTo(knex.fn.now()).alter();
    table.dateTime(UPDATED_AT_COLUMN).defaultTo(knex.fn.now()).alter();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
    table.dropColumn(CREATED_AT_COLUMN);
  });
};
