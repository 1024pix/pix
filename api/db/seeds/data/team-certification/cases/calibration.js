let calibrationId = 0;

export async function buildDataCalibrationForVersion({ knex, datawarehouseKnex, versionId, scope, status }) {
  ++calibrationId;
  if (calibrationId === 1) {
    await initTables(datawarehouseKnex);
  }
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
  const tubeIds = await knex.pluck('tube_id').from('certification_versions_tubes').where('version_id', versionId);
  const challengeIds = await knex
    .from({ skills: 'learningcontent.skills' })
    .join({ challenges: 'learningcontent.challenges' }, 'challenges.skillId', 'skills.id')
    .whereIn('skills.tubeId', tubeIds)
    .where('challenges.status', 'validé')
    .pluck('challenges.id');

  await datawarehouseKnex('data_calibrations').insert({
    id: calibrationId,
    calibration_date: fourMonthsAgo,
    scope,
    status,
  });

  const calibratedChallengesToInsert = challengeIds.map((challengeId) => {
    return {
      calibration_id: calibrationId,
      challenge_id: challengeId,
      alpha: 1,
      delta: 1,
      is_excluded: false,
    };
  });
  await datawarehouseKnex('data_calibration_challenges').insert(calibratedChallengesToInsert);
}

async function initTables(datawarehouseKnex) {
  if (await datawarehouseKnex.schema.hasTable('data_calibration_challenges')) {
    await datawarehouseKnex.schema.dropTable('data_calibration_challenges');
    await datawarehouseKnex.schema.dropTable('data_calibrations');
  }
  await datawarehouseKnex.schema.createTable('data_calibrations', (t) => {
    t.increments('id').primary();
    t.dateTime('calibration_date');
    t.string('status');
    t.string('scope');
  });
  await datawarehouseKnex.schema.createTable('data_calibration_challenges', (t) => {
    t.increments('id').primary();
    t.integer('calibration_id').references('data_calibrations.id');
    t.string('challenge_id');
    t.decimal('alpha', 6, 5);
    t.decimal('delta', 6, 5);
    t.boolean('is_excluded');
  });
}
