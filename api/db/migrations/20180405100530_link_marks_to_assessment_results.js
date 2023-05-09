import { batch } from '../batch-processing.js';

const TABLE_NAME_ASSESSMENT_RESULTS = 'assessment-results';
const TABLE_NAME_MARKS = 'marks';

const up = function(knex) {
  return knex.schema
    .table(TABLE_NAME_MARKS, function (table) {
      table.integer('assessmentResultId').unsigned();
      table.foreign('assessmentResultId').references('assessment-results.id');
      table.index('assessmentResultId');
    })
    .then(() => {
      return knex(TABLE_NAME_ASSESSMENT_RESULTS).select('id', 'assessmentId');
    })
    .then((allAssessmentResults) => {
      return batch(knex, allAssessmentResults, (result) => {
        return knex(TABLE_NAME_MARKS).where('assessmentId', '=', result.assessmentId).update({
          assessmentResultId: result.id,
        });
      });
    });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME_MARKS, function (table) {
    table.dropColumn('assessmentResultId');
  });
};

export { up, down };
