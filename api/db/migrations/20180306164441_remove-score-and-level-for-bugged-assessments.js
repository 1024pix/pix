const { batch } = require('../batchTreatment');

const TABLE_NAME_ASSESSMENTS = 'assessments';

exports.up = function(knex) {
  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id', 'estimatedLevel', 'pixScore', 'type')
    .where('type', '=', 'PLACEMENT')
    .where('pixScore', '=', '0')
    .where('estimatedLevel', '>', '0')

    .then((allAssessmentsWithBuggedScore) => {
      return batch(knex, allAssessmentsWithBuggedScore, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS)
          .where('id', '=', assessment.id)
          .update({
            pixScore: null,
            estimatedLevel: null,
            updatedAt: knex.fn.now()
          });
      });
    });
};

exports.down = function() {
};
