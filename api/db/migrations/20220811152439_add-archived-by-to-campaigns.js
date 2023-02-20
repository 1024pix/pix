const TABLE_NAME = 'campaigns';
const ARCHIVEDBY_COLUMN = 'archivedBy';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.bigInteger(ARCHIVEDBY_COLUMN).index().references('users.id');
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(ARCHIVEDBY_COLUMN);
  });
};
