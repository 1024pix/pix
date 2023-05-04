const TABLE_NAME = 'certification-center-memberships';
const USERID_COLUMN = 'userId';
const CERTIFICATIONCENTERID_COLUMN = 'certificationCenterId';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(USERID_COLUMN);
    table.dropIndex(CERTIFICATIONCENTERID_COLUMN);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(USERID_COLUMN);
    table.index(CERTIFICATIONCENTERID_COLUMN);
  });
};

export { up, down };
