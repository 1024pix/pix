const TABLE_NAME = 'knowledge-elements';
const SKILLID_COLUMN = 'skillId';
const ANSWERID_COLUMN = 'answerId';
const ASSESSMENTID_COLUMN = 'assessmentId';
const COMPETENCEID_COLUMN = 'competenceId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(SKILLID_COLUMN);
    table.dropIndex(ANSWERID_COLUMN);
    table.dropIndex(ASSESSMENTID_COLUMN);
    table.dropIndex(COMPETENCEID_COLUMN);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(SKILLID_COLUMN);
    table.index(ANSWERID_COLUMN);
    table.index(ASSESSMENTID_COLUMN);
    table.index(COMPETENCEID_COLUMN);
  });
};
