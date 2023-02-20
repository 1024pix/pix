const TABLE_NAME = 'flash-assessment-results';

export const up = async function (knex) {
  await knex.schema.raw('alter table "flash-assessment-results" alter column id type bigint');

  await knex.schema.table(TABLE_NAME, (t) => {
    t.bigInteger('answerId').nullable().references('answers.id');
  });

  await knex(TABLE_NAME).update({
    answerId: knex('answers')
      .select('answers.id')
      .where('answers.assessmentId', knex.ref('flash-assessment-results.assessmentId'))
      .orderBy('createdAt', 'desc')
      .limit(1),
  });

  await knex.schema.table(TABLE_NAME, (t) => {
    t.dropNullable('answerId');
    t.unique('answerId');
    t.dropColumn('assessmentId');
  });
};

export const down = async function (knex) {
  await knex(TABLE_NAME)
    .whereIn(
      'answerId',
      knex({
        answerRanked: knex(TABLE_NAME)
          .join('answers', 'answers.id', 'answerId')
          .select('answerId')
          .rank(
            'rank',
            function () {
              this.orderBy('createdAt', 'desc');
            },
            'assessmentId'
          ),
      })
        .select('answerRanked.answerId')
        .where('answerRanked.rank', '>', 1)
    )
    .delete();

  await knex.schema.table(TABLE_NAME, (t) => {
    t.integer('assessmentId').nullable().references('assessments.id');
  });

  await knex(TABLE_NAME).update({
    assessmentId: knex('answers')
      .select('answers.assessmentId')
      .where('answers.id', knex.ref('flash-assessment-results.answerId')),
  });

  await knex.schema.table(TABLE_NAME, (t) => {
    t.dropNullable('assessmentId');
    t.unique('assessmentId');
    t.dropColumn('answerId');
  });
};
