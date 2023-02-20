const TABLE_NAME = 'memberships';
const COLUMN_NAME = 'updatedByUserId';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).unsigned().references('users.id');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
