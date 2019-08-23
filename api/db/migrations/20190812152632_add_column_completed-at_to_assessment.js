const { batch } = require('../batchTreatment');

const TABLE_ASSESSMENTS_NAME = 'assessments';
const COLUMN_NAME = 'completedAt';

exports.up = async function(knex) {

  await knex.schema.table(TABLE_ASSESSMENTS_NAME, (table) => {
    table.dateTime(COLUMN_NAME).defaultTo(null);
  });

  const assessmentsCompleted = await knex(TABLE_ASSESSMENTS_NAME)
    .select('id', 'state', 'completedAt', 'updatedAt')
    .where('state', '=', 'completed')
    .andWhere('completedAt', null);

  return batch(knex, assessmentsCompleted, async (assessment) => {
    const lastAnswers = await knex('answers')
      .select('createdAt')
      .where('assessmentId', '=', assessment.id)
      .orderBy('createdAt', 'desc')
      .limit(1);
    console.log(lastAnswers[0]);
    console.log(assessment);
    if(lastAnswers[0]) {
      return knex(TABLE_ASSESSMENTS_NAME)
        .where('id', '=', assessment.id)
        .update('completedAt', lastAnswers[0].createdAt);
    } else {
      return knex(TABLE_ASSESSMENTS_NAME)
        .where('id', '=', assessment.id)
        .update('completedAt',assessment.updatedAt);
    }
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_ASSESSMENTS_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
