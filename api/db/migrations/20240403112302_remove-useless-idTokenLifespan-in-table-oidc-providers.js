const TABLE_NAME = 'oidc-providers';
const COLUMN_NAME = 'idTokenLifespan';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string('idTokenLifespan').notNullable();
  });
};

export { down, up };
