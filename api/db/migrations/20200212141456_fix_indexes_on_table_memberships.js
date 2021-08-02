const TABLE_NAME = 'memberships';
const USER_ID_COLUMN = 'userId';
const ORGANIZATION_ID_COLUMN = 'organizationId';
// cspell:disable-next
const OLD_INDEX_USER_ID = 'organizations_accesses_userid_index';
// cspell:disable-next
const OLD_INDEX_ORGANIZATION_ID = 'organizations_accesses_organizationid_index';

exports.up = async function(knex) {
  await knex.raw(`DROP INDEX IF EXISTS ${OLD_INDEX_USER_ID}`);
  await knex.raw(`DROP INDEX IF EXISTS ${OLD_INDEX_ORGANIZATION_ID}`);
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ORGANIZATION_ID_COLUMN);
  });
};

exports.down = async function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ORGANIZATION_ID_COLUMN);
    table.index(USER_ID_COLUMN, OLD_INDEX_USER_ID);
    table.index(ORGANIZATION_ID_COLUMN, OLD_INDEX_ORGANIZATION_ID);
  });
};
