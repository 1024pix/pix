const TABLE_NAME = 'memberships';
const COLUMN_NAME = 'updatedByUserId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).unsigned().references('users.id');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
