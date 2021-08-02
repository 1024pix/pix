const TABLE_NAME = 'certification-center-memberships';
const USER_ID_COLUMN = 'userId';
const CERTIFICATION_CENTER_ID_COLUMN = 'certificationCenterId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(USER_ID_COLUMN);
    table.dropIndex(CERTIFICATION_CENTER_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(USER_ID_COLUMN);
    table.index(CERTIFICATION_CENTER_ID_COLUMN);
  });
};
