const TABLE_NAME = 'flash-algorithm-configurations';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (t) {
    t.increments().primary();
    t.integer('warmUpLength');
    t.jsonb('forcedCompetences');
    t.integer('maximumAssessmentLength');
    t.integer('challengesBetweenSameCompetence');
    t.jsonb('minimumEstimatedSuccessRateRanges');
    t.boolean('limitToOneQuestionPerTube');
    t.boolean('enablePassageByAllCompetences');
    t.integer('variationPercent');
    t.integer('doubleMeasuresUntil');
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
