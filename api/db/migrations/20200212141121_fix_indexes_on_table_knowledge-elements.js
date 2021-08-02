const TABLE_NAME = 'knowledge-elements';
const SKILL_ID_COLUMN = 'skillId';
const ANSWER_ID_COLUMN = 'answerId';
const ASSESSMENT_ID_COLUMN = 'assessmentId';
const COMPETENCE_ID_COLUMN = 'competenceId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(SKILL_ID_COLUMN);
    table.dropIndex(ANSWER_ID_COLUMN);
    table.dropIndex(ASSESSMENT_ID_COLUMN);
    table.dropIndex(COMPETENCE_ID_COLUMN);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(SKILL_ID_COLUMN);
    table.index(ANSWER_ID_COLUMN);
    table.index(ASSESSMENT_ID_COLUMN);
    table.index(COMPETENCE_ID_COLUMN);
  });
};
