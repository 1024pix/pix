const TABLE_NAME = 'organization-learner-import-formats';
const COLUMN_NAME = 'id';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.increments(COLUMN_NAME).primary();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
