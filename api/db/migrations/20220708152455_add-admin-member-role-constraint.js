const TABLE_NAME = 'pix-admin-roles';
const CONSTRAINT_NAME = 'one_role_per_user';

exports.up = async (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique('userId', { indexName: CONSTRAINT_NAME });
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('userId', CONSTRAINT_NAME);
  });
};
