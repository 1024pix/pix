import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger, SCOPES } from '../../../../shared/infrastructure/utils/logger.js';
import { CalibratedChallenge, Calibration, CALIBRATION_STATUSES } from '../../domain/models/Calibration.js';

/**
 * Reads the global scoring configuration (the capacity meshes) carried by a calibration in the datamart.
 * Only a validated scoring meshes set is usable; if a calibration holds several of them, the most recent prevails.
 *
 * @param {object} params
 * @param {number|null} params.calibrationId
 * @returns {Promise<Array<{meshLevel: number, bounds: {min: number, max: number}}>>} empty when the calibration
 * carries no validated scoring meshes, or when there is no calibration at all
 */
export async function findGlobalScoringConfiguration({ calibrationId }) {
  if (!calibrationId) return [];

  try {
    const scoringMeshesSet = await datamartKnex
      .select('id')
      .from('data_scoring_meshes_all')
      .where({ calibration_id: calibrationId, status: CALIBRATION_STATUSES.VALIDATED })
      .orderBy('id', 'desc')
      .first();

    if (!scoringMeshesSet) return [];

    const scoringMeshes = await datamartKnex
      .select({
        meshLevel: 'mesh',
        min: 'min_bound_curated_value',
        max: 'max_bound_curated_value',
      })
      .from('data_scoring_meshes')
      .where({ scoring_meshes_all_id: scoringMeshesSet.id })
      .orderBy('mesh', 'asc');

    return scoringMeshes.map(({ meshLevel, min, max }) => ({ meshLevel, bounds: { min, max } }));
  } catch (err) {
    logger.error(
      { event: SCOPES.CERTIFICATION },
      `Error while retrieving the scoring meshes of the calibration of ID ${calibrationId} from datamart : ${err}`,
    );
    throw err;
  }
}

export async function find(calibrationId) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const generalInfo = await datamartKnex
      .select({ id: 'id', startedAt: 'calibration_date', status: 'status', scope: 'scope' })
      .from('data_calibrations')
      .where({ id: calibrationId })
      .first();

    if (!generalInfo) return null;

    const calibratedChallengesData = await datamartKnex
      .select({
        challengeId: 'challenge_id',
        alpha: 'alpha',
        delta: 'delta',
      })
      .from('data_active_calibrated_challenges')
      .where({ calibration_id: calibrationId });

    let calibratedChallenges = [];
    if (calibratedChallengesData.length > 0) {
      const tubeAndChallengeData = await knexConn
        .select({ challengeId: 'learningcontent.challenges.id', tubeId: 'learningcontent.skills.tubeId' })
        .from('learningcontent.challenges')
        .join('learningcontent.skills', 'learningcontent.skills.id', 'learningcontent.challenges.skillId')
        .whereIn(
          'learningcontent.challenges.id',
          calibratedChallengesData.map((data) => data.challengeId),
        );
      const tubeByChallenge = new Map(tubeAndChallengeData.map(({ challengeId, tubeId }) => [challengeId, tubeId]));

      calibratedChallenges = calibratedChallengesData.map(
        (calibratedChallengeData) =>
          new CalibratedChallenge({
            ...calibratedChallengeData,
            tubeId: tubeByChallenge.get(calibratedChallengeData.challengeId),
            alpha: Number(calibratedChallengeData.alpha),
            delta: Number(calibratedChallengeData.delta),
          }),
      );
    }

    return new Calibration({
      ...generalInfo,
      calibratedChallenges,
    });
  } catch (err) {
    logger.error(
      { event: SCOPES.CERTIFICATION },
      `Error while retrieving the calibration data of ID ${calibrationId} from datamart : ${err}`,
    );
    throw err;
  }
}
