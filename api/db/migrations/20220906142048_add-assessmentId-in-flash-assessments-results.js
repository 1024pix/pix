import bluebird from 'bluebird';
const TABLE_NAME = 'flash-assessment-results';
const COLUMN_NAME = 'assessmentId';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => table.integer(COLUMN_NAME).references('assessments.id'));

  const flashAssessmentResults = await knex(TABLE_NAME)
    .select('answers.assessmentId', 'flash-assessment-results.id')
    .join('answers', 'answers.id', 'flash-assessment-results.answerId');

  await bluebird.each(flashAssessmentResults, async function ({ assessmentId, id }) {
    await knex(TABLE_NAME).update({ assessmentId }).where({ id });
  });

  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => table.dropColumn(COLUMN_NAME));
};
