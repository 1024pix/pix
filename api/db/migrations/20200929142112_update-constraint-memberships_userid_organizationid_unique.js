const TABLE_NAME = 'memberships';
const USER_ID_COLUMN = 'userId';
const ORGANIZATION_ID_COLUMN = 'organizationId';
const DISABLED_AT_COLUMN = 'disabledAt';
// cspell:disable-next
const NEW_CONSTRAINT_NAME = 'memberships_userid_organizationid_disabledAt_unique';

exports.up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.dropUnique([USER_ID_COLUMN, ORGANIZATION_ID_COLUMN]);
  });
  return knex.raw(`CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON ${TABLE_NAME} ("${USER_ID_COLUMN}", "${ORGANIZATION_ID_COLUMN}") WHERE "${DISABLED_AT_COLUMN}" IS NULL;`);
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropUnique(null, NEW_CONSTRAINT_NAME);
    table.unique([USER_ID_COLUMN, ORGANIZATION_ID_COLUMN]);
  });
};
