const TABLE_NAME = 'certification-candidates';
const SESSIONID_COLUMN = 'sessionId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(SESSIONID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(SESSIONID_COLUMN);
  });
};
