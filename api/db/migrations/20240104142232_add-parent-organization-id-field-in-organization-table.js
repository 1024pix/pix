const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'parentOrganizationId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).defaultTo(null).references('organizations.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
