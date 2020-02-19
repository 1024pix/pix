const TABLE_NAME = 'memberships';
const USERID_COLUMN = 'userId';
const ORGANIZATIONID_COLUMN = 'organizationId';
const OLD_INDEX_USERID = 'organizations_accesses_userid_index';
const OLD_INDEX_ORGANIZATIONID = 'organizations_accesses_organizationid_index';

exports.up = async function(knex) {
  await knex.raw(`DROP INDEX IF EXISTS ${OLD_INDEX_USERID}`);
  await knex.raw(`DROP INDEX IF EXISTS ${OLD_INDEX_ORGANIZATIONID}`);
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(ORGANIZATIONID_COLUMN);
  });
};

exports.down = async function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(ORGANIZATIONID_COLUMN);
    table.index(USERID_COLUMN, OLD_INDEX_USERID);
    table.index(ORGANIZATIONID_COLUMN, OLD_INDEX_ORGANIZATIONID);
  });
};
