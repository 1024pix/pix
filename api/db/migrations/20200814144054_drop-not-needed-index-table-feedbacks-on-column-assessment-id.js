const TABLE_NAME = 'feedbacks';
const ASSESSMENTID_COLUMN = 'assessmentId';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(ASSESSMENTID_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(ASSESSMENTID_COLUMN);
  });
};

export { up, down };
