const TABLE_NAME = 'organizations';
const USER_ID_COLUMN = 'userId';
const PROVINCE_CODE_COLUMN = 'provinceCode';
const EXTERNAL_ID_COLUMN = 'externalId';
const CODE_COLUMN = 'code';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(USER_ID_COLUMN);
    table.dropIndex(PROVINCE_CODE_COLUMN);
    table.dropIndex(EXTERNAL_ID_COLUMN);
    table.index(CODE_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(USER_ID_COLUMN);
    table.index(PROVINCE_CODE_COLUMN);
    table.index(EXTERNAL_ID_COLUMN);
    table.dropIndex(CODE_COLUMN);
  });
};
