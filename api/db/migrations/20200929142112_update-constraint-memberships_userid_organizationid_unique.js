const TABLE_NAME = 'memberships';
const USERID_COLUMN = 'userId';
const ORGANIZATIONID_COLUMN = 'organizationId';
const DISABLEDAT_COLUMN = 'disabledAt';
const NEW_CONSTRAINT_NAME = 'memberships_userid_organizationid_disabledAt_unique';

exports.up = async function(knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique([USERID_COLUMN, ORGANIZATIONID_COLUMN]);
  });
  return knex.raw(`CREATE UNIQUE INDEX ${NEW_CONSTRAINT_NAME} ON ${TABLE_NAME} ("${USERID_COLUMN}", "${ORGANIZATIONID_COLUMN}") WHERE "${DISABLEDAT_COLUMN}" IS NULL;`);
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(null, NEW_CONSTRAINT_NAME);
    table.unique([USERID_COLUMN, ORGANIZATIONID_COLUMN]);
  });
};
