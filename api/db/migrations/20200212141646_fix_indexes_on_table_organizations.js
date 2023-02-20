const TABLE_NAME = 'organizations';
const USERID_COLUMN = 'userId';
const PROVINCECODE_COLUMN = 'provinceCode';
const EXTERNALID_COLUMN = 'externalId';
const CODE_COLUMN = 'code';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(USERID_COLUMN);
    table.dropIndex(PROVINCECODE_COLUMN);
    table.dropIndex(EXTERNALID_COLUMN);
    table.index(CODE_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(USERID_COLUMN);
    table.index(PROVINCECODE_COLUMN);
    table.index(EXTERNALID_COLUMN);
    table.dropIndex(CODE_COLUMN);
  });
};
