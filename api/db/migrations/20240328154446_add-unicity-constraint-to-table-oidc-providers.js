const TABLE_NAME = 'oidc-providers';
const COLUMN_NAME = 'identityProvider';

const up = async function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropUnique(COLUMN_NAME);
  });
};

export { down, up };
