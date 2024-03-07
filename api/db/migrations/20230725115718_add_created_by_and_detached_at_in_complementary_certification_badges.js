const TABLE_NAME = 'complementary-certification-badges';
const CREATED_BY_COLUMN = 'createdBy';
const DETACHED_AT_COLUMN = 'detachedAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dateTime(DETACHED_AT_COLUMN).nullable();
    table.integer(CREATED_BY_COLUMN).references('users.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(CREATED_BY_COLUMN);
    table.dropColumn(DETACHED_AT_COLUMN);
  });
};

export { down, up };
