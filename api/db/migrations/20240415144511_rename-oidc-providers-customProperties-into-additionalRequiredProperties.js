const TABLE_NAME = 'oidc-providers';
const COLUMN_NEW_NAME = 'additionalRequiredProperties';
const COLUMN_OLD_NAME = 'customProperties';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NEW_NAME);
    table.dropColumn(COLUMN_OLD_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_OLD_NAME);
    table.dropColumn(COLUMN_NEW_NAME);
  });
};

export { down, up };
