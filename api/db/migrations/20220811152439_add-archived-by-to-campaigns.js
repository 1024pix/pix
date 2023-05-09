const TABLE_NAME = 'campaigns';
const ARCHIVEDBY_COLUMN = 'archivedBy';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.bigInteger(ARCHIVEDBY_COLUMN).index().references('users.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(ARCHIVEDBY_COLUMN);
  });
};

export { up, down };
