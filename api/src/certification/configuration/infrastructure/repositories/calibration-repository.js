import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger, SCOPES } from '../../../../shared/infrastructure/utils/logger.js';
import {
  CalibratedChallenge,
  Calibration,
  CALIBRATION_STATUSES,
  CalibrationForReport,
  CalibrationScoringMesh,
  toCalibrationScope,
} from '../../domain/models/Calibration.js';

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @returns {Promise<CalibrationForReport|null>}
 */
export async function findLatestForReport({ scope }) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const generalInfo = await datamartKnex
      .select({ id: 'id', startedAt: 'calibration_date', status: 'status', scope: 'scope' })
      .from('data_calibrations')
      .where({ scope: toCalibrationScope(scope) })
      .orderBy([
        { column: 'calibration_date', order: 'desc' },
        { column: 'id', order: 'desc' },
      ])
      .first();

    if (!generalInfo) return null;

    const calibrationId = generalInfo.id;

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
    let challengeCountByLocale = {};
    if (challengeIds.length > 0) {
      const challengeRows = await knexConn
        .select({
          tubeId: 'learningcontent.skills.tubeId',
          locales: 'learningcontent.challenges.locales',
        })
        .from('learningcontent.challenges')
        .join('learningcontent.skills', 'learningcontent.skills.id', 'learningcontent.challenges.skillId')
        .whereIn('learningcontent.challenges.id', challengeIds);
      tubeIds = new Set(challengeRows.map((row) => row.tubeId));
      challengeCountByLocale = _countChallengesByLocale(challengeRows);
    }

    return new CalibrationForReport({
      ...generalInfo,
      challengeCount: challengeIds.length,
      challengeCountByLocale,
      tubeIds,
      hasMeshScoring: Boolean(meshScoringRow),
      hasCompetenceScoring: Boolean(competenceScoringRow),
    });
  } catch (err) {
    logger.error(
      { event: SCOPES.CERTIFICATION },
      `Error while retrieving the latest calibration data of scope ${scope} from datamart : ${err}`,
    );
    throw err;
  }
}

/**
 * @param {Array<{locales: Array<string>|null}>} challengeRows
 * @returns {Object<string, number>}
 */
function _countChallengesByLocale(challengeRows) {
  const challengeCountByLocale = {};
  for (const { locales } of challengeRows) {
    for (const locale of locales ?? []) {
      challengeCountByLocale[locale] = (challengeCountByLocale[locale] ?? 0) + 1;
    }
  }
  return challengeCountByLocale;
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

    const scoringMeshes = await _findScoringMeshes(calibrationId);

    return new Calibration({
      ...generalInfo,
      calibratedChallenges,
      scoringMeshes,
    });
  } catch (err) {
    logger.error(
      { event: SCOPES.CERTIFICATION },
      `Error while retrieving the calibration data of ID ${calibrationId} from datamart : ${err}`,
    );
    throw err;
  }
}

/**
 * @param {number} calibrationId
 * @returns {Promise<Array<CalibrationScoringMesh>>}
 */
async function _findScoringMeshes(calibrationId) {
  const meshSetData = await datamartKnex
    .select({ id: 'id' })
    .from('data_scoring_meshes_all')
    .where({ calibration_id: calibrationId, status: CALIBRATION_STATUSES.VALIDATED })
    .orderBy('id', 'desc')
    .first();

  if (!meshSetData) return [];

  const meshesData = await datamartKnex
    .select({
      mesh: 'mesh',
      minBoundCuratedValue: 'min_bound_curated_value',
      maxBoundCuratedValue: 'max_bound_curated_value',
    })
    .from('data_scoring_meshes')
    .where({ scoring_meshes_all_id: meshSetData.id })
    .orderBy('mesh', 'asc');

  return meshesData.map(
    (meshData) =>
      new CalibrationScoringMesh({
        mesh: Number(meshData.mesh),
        minBoundCuratedValue: Number(meshData.minBoundCuratedValue),
        maxBoundCuratedValue: Number(meshData.maxBoundCuratedValue),
      }),
  );
}
