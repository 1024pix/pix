const TABLE_NAME = 'oidc-providers';
const COLUMN_NAME = 'claimMapping';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
