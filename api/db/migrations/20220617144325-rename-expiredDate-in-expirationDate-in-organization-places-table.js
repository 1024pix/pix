const TABLE_NAME = 'organization-places';
const OLD_COLUMN_NAME = 'expiredDate';
const NEW_COLUMN_NAME = 'expirationDate';

const up = async function (knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

const down = async function (knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};

export { up, down };
