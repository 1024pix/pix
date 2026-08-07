let calibrationId = 0;

export async function buildDataCalibrationForVersion({ knex, datamartKnex, versionId, scope, status }) {
  calibrationId++;

  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
  const tubeIds = await knex.pluck('tube_id').from('certification_versions_tubes').where('version_id', versionId);
  const challengeIds = await knex
    .from({ skills: 'learningcontent.skills' })
    .join({ challenges: 'learningcontent.challenges' }, 'challenges.skillId', 'skills.id')
    .whereIn('skills.tubeId', tubeIds)
    .where('challenges.status', 'validé')
    .pluck('challenges.id');

  await datamartKnex('data_calibrations').insert({
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
    };
  });
  await datamartKnex('data_active_calibrated_challenges').insert(calibratedChallengesToInsert);
}
