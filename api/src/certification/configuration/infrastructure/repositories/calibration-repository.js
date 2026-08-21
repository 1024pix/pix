import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger, SCOPES } from '../../../../shared/infrastructure/utils/logger.js';
import { CalibratedChallenge, Calibration, CalibrationForReport } from '../../domain/models/Calibration.js';

export async function findForReport(calibrationId) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const generalInfo = await datamartKnex
      .select({ id: 'id', startedAt: 'calibration_date', status: 'status', scope: 'scope' })
      .from('data_calibrations')
      .where({ id: calibrationId })
      .first();

    if (!generalInfo) return null;

    const [challengeIds, meshScoringRow, competenceScoringRow] = await Promise.all([
      datamartKnex
        .pluck('challenge_id')
        .from('data_active_calibrated_challenges')
        .where({ calibration_id: calibrationId }),
      datamartKnex
        .first('id')
        .from('data_scoring_meshes_all')
        .where({ calibration_id: calibrationId, status: 'VALIDATED' }),
      datamartKnex
        .first('id')
        .from('data_scoring_thresholds_all')
        .where({ calibration_id: calibrationId, status: 'VALIDATED' }),
    ]);

    let tubeIds = new Set();
    if (challengeIds.length > 0) {
      const tubeIdRows = await knexConn
        .distinct('learningcontent.skills.tubeId')
        .from('learningcontent.challenges')
        .join('learningcontent.skills', 'learningcontent.skills.id', 'learningcontent.challenges.skillId')
        .whereIn('learningcontent.challenges.id', challengeIds);
      tubeIds = new Set(tubeIdRows.map((row) => row.tubeId));
    }

    return new CalibrationForReport({
      ...generalInfo,
      challengeCount: challengeIds.length,
      tubeIds,
      hasMeshScoring: Boolean(meshScoringRow),
      hasCompetenceScoring: Boolean(competenceScoringRow),
    });
  } catch (err) {
    logger.error(
      { event: SCOPES.CERTIFICATION },
      `Error while retrieving the calibration data of ID ${calibrationId} from datamart : ${err}`,
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
