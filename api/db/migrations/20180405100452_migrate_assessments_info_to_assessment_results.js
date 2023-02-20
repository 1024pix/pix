import { batch } from '../batch-processing';

const TABLE_NAME_ASSESSMENT_RESULT = 'assessment-results';
const TABLE_NAME_ASSESSMENTS = 'assessments';

export const up = function (knex) {
  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id', 'type', 'createdAt', 'pixScore', 'estimatedLevel')
    .where('state', '!=', 'started')
    .then((allAssessments) => {
      return batch(knex, allAssessments, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENT_RESULT).insert({
          createdAt: assessment.createdAt,
          level: assessment.estimatedLevel,
          pixScore: assessment.pixScore,
          emitter: 'PIX-ALGO',
          commentForJury: 'Computed',
          assessmentId: assessment.id,
          status: 'validated',
        });
      });
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME_ASSESSMENTS, function (table) {
        table.dropColumn('pixScore');
        table.dropColumn('estimatedLevel');
      });
    });
};

export const down = function (knex) {
  return knex.schema
    .table(TABLE_NAME_ASSESSMENTS, function (table) {
      table.integer('pixScore');
      table.integer('estimatedLevel');
    })
    .then(() => knex(TABLE_NAME_ASSESSMENT_RESULT).select('id', 'assessmentId', 'pixScore', 'level'))
    .then((allAssessmentResults) => {
      return batch(knex, allAssessmentResults, (result) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', result.assessmentId).update({
          estimatedLevel: result.level,
          pixScore: result.pixScore,
        });
      });
    })
    .then(() => {
      return knex(TABLE_NAME_ASSESSMENT_RESULT).delete();
    });
};
