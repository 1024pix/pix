import { batch } from '../batch-processing';

const TABLE_NAME_MARKS = 'marks';
const TABLE_NAME_COMPETENCE_MARKS = 'competence-marks';
const TABLE_NAME_ASSESSMENT_RESULTS = 'assessment-results';

export const up = function (knex) {
  return knex(TABLE_NAME_MARKS)
    .select('id', 'level', 'score', 'area_code', 'competence_code', 'assessmentResultId')
    .then((allMarks) => {
      return batch(knex, allMarks, (mark) => {
        return knex(TABLE_NAME_COMPETENCE_MARKS).insert({
          level: mark.level,
          score: mark.score,
          area_code: mark.area_code,
          competence_code: mark.competence_code,
          assessmentResultId: mark.assessmentResultId,
        });
      });
    })
    .then(() => knex.schema.dropTable(TABLE_NAME_MARKS));
};

export const down = function (knex) {
  return knex.schema
    .createTable(TABLE_NAME_MARKS, (t) => {
      t.increments().primary();
      t.integer('level').unsigned();
      t.integer('score').unsigned();
      t.text('area_code').notNull();
      t.text('competence_code').notNull();
      t.integer('assessmentId').unsigned().references('assessments.id');
      t.integer('assessmentResultId').unsigned();
    })
    .then(() =>
      knex(TABLE_NAME_COMPETENCE_MARKS).select('id', 'level', 'score', 'area_code', 'competence_code', 'correctionId')
    )
    .then((allMarks) => {
      return batch(knex, allMarks, (mark) => {
        return knex(TABLE_NAME_MARKS).insert({
          level: mark.level,
          score: mark.score,
          area_code: mark.area_code,
          competence_code: mark.competence_code,
          assessmentResultId: mark.assessmentResultId,
        });
      });
    })
    .then(() => knex(TABLE_NAME_ASSESSMENT_RESULTS).select('id', 'assessmentId'))
    .then((allAssessmentResults) => {
      return batch(knex, allAssessmentResults, (result) => {
        return knex(TABLE_NAME_MARKS).where('assessmentResultId', '=', result.id).update({
          assessmentId: result.assessmentResultId,
        });
      });
    });
};
