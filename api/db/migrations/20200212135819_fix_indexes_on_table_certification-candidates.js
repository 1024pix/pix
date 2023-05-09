const TABLE_NAME = 'certification-candidates';
const SESSIONID_COLUMN = 'sessionId';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(SESSIONID_COLUMN);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(SESSIONID_COLUMN);
  });
};

export { up, down };
