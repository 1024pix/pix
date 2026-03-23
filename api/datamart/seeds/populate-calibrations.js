import { complementaryCertifications } from '../../db/seeds/data/team-certification/shared/complementary-certifications.js';
import { ComplementaryCertificationKeys } from '../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

async function insertCalibrations({ knex }) {
  const id = nextCalibrationId();
  await knex.batchInsert('data_calibrations', [
    {
      id,
      calibration_date: new Date(),
      status: 'VALIDATED',
      scope: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
    },
  ]);
  await insertActiveCalibratedChallenges({ knex, calibrationId: id });
}

async function insertActiveCalibratedChallenges({ knex, calibrationId }) {
  const challengeIds = complementaryCertifications[0].challengeIds;

  const activeCalibratedChallenges = challengeIds.map((challengeId) => {
    return {
      calibration_id: calibrationId,
      challenge_id: challengeId,
      alpha: 2.3,
      delta: 5.1,
    };
  });
  await knex.batchInsert('data_active_calibrated_challenges', activeCalibratedChallenges);
}

function nextCalibrationId(startingFrom = 10000) {
  return startingFrom++;
}

export async function seed(knex) {
  insertCalibrations({ knex });
}
