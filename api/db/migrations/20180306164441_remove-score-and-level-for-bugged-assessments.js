import { batch } from '../batch-processing.js';

const TABLE_NAME_ASSESSMENTS = 'assessments';

const up = function(knex) {
  return knex(TABLE_NAME_ASSESSMENTS)
    .select('id', 'estimatedLevel', 'pixScore', 'type')
    .where('type', '=', 'PLACEMENT')
    .where('pixScore', '=', '0')
    .where('estimatedLevel', '>', '0')

    .then((allAssessmentsWithBuggedScore) => {
      return batch(knex, allAssessmentsWithBuggedScore, (assessment) => {
        return knex(TABLE_NAME_ASSESSMENTS).where('id', '=', assessment.id).update({
          pixScore: null,
          estimatedLevel: null,
          updatedAt: knex.fn.now(),
        });
      });
    });
};

const down = function() {
  return;
};

export { up, down };
