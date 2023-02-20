const TABLE_NAME = 'feedbacks';
const ASSESSMENTID_COLUMN = 'assessmentId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(ASSESSMENTID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(ASSESSMENTID_COLUMN);
  });
};
