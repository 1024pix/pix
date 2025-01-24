const TABLE_NAME = 'organization-invitations';
const COLUMN_NAME = 'locale';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo('fr');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
