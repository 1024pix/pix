import dayjs from 'dayjs';

import { knex as apiKnex } from '../../db/knex-database-connection.js';
import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
  fromCalibrationScope,
} from '../../src/certification/configuration/domain/models/Calibration.js';
import { VERSION_STATUSES } from '../../src/certification/configuration/domain/models/Version.js';
import { config } from '../../src/shared/config.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { knex as datamartKnex } from '../knex-database-connection.js';

const CALIBRATION_AGE_IN_MONTHS = 4;
const ALPHA = 1;
const DELTA = 1;

/**
 * @param {Object} params
 * @param {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]} params.calibrationScope
 * @returns {Promise<{id: number, globalScoringConfiguration: Array<object>|null, competencesScoringConfiguration: Array<object>|null}|undefined>}
 */
async function findActiveVersion({ calibrationScope }) {
  return apiKnex('certification_versions')
    .select('id', 'globalScoringConfiguration', 'competencesScoringConfiguration')
    .where({ scope: fromCalibrationScope(calibrationScope), status: VERSION_STATUSES.ACTIVE })
    .orderBy('id', 'desc')
    .first();
}

/**
 * @param {Object} params
 * @param {number} params.versionId
 * @returns {Promise<Array<string>>}
 */
async function findChallengeIdsToCalibrate({ versionId }) {
  const tubeIds = await apiKnex.pluck('tube_id').from('certification_versions_tubes').where('version_id', versionId);

  return apiKnex
    .from({ skills: 'learningcontent.skills' })
    .join({ challenges: 'learningcontent.challenges' }, 'challenges.skillId', 'skills.id')
    .whereIn('skills.tubeId', tubeIds)
    .where('challenges.status', 'validé')
    .pluck('challenges.id');
}

/**
 * Returns the capacity scale of a version, used to clamp the competence bounds: the API configuration widens its
 * extreme intervals with `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`, whereas the datamart carries finite
 * curated values.
 *
 * @param {Array<{bounds: {min: number, max: number}}>} globalScoringConfiguration
 * @returns {{min: number, max: number}}
 */
function getCapacityBounds(globalScoringConfiguration) {
  return {
    min: Math.min(...globalScoringConfiguration.map(({ bounds }) => bounds.min)),
    max: Math.max(...globalScoringConfiguration.map(({ bounds }) => bounds.max)),
  };
}

/**
 * @param {Object} params
 * @param {number} params.calibrationId
 * @param {Array<{meshLevel: number, bounds: {min: number, max: number}}>} params.globalScoringConfiguration
 * @returns {Promise<number>} the number of seeded meshes
 */
async function seedScoringMeshes({ calibrationId, globalScoringConfiguration }) {
  await datamartKnex('data_scoring_meshes_all').insert({
    id: calibrationId,
    calibration_id: calibrationId,
    status: CALIBRATION_STATUSES.VALIDATED,
  });

  const meshes = globalScoringConfiguration.map(({ meshLevel, bounds }) => ({
    scoring_meshes_all_id: calibrationId,
    mesh: meshLevel,
    min_bound_curated_value: bounds.min,
    max_bound_curated_value: bounds.max,
  }));

  await datamartKnex.batchInsert('data_scoring_meshes', meshes);

  return meshes.length;
}

/**
 * @param {Object} params
 * @param {number} params.calibrationId
 * @param {{min: number, max: number}} params.capacityBounds
 * @param {Array<{competenceId: string, values: Array<{competenceLevel: number, bounds: {min: number, max: number}}>}>} params.competencesScoringConfiguration
 * @returns {Promise<number>} the number of seeded thresholds
 */
async function seedScoringThresholds({ calibrationId, capacityBounds, competencesScoringConfiguration }) {
  await datamartKnex('data_scoring_thresholds_all').insert({
    id: calibrationId,
    calibration_id: calibrationId,
    status: CALIBRATION_STATUSES.VALIDATED,
  });

  const thresholds = competencesScoringConfiguration.flatMap(({ competenceId, values }) =>
    values.map(({ competenceLevel, bounds }) => ({
      scoring_thresholds_all_id: calibrationId,
      level: competenceLevel,
      competence_id: competenceId,
      min_bound_curated_value: Math.max(bounds.min, capacityBounds.min),
      max_bound_curated_value: Math.min(bounds.max, capacityBounds.max),
    })),
  );

  await datamartKnex.batchInsert('data_scoring_thresholds', thresholds);

  return thresholds.length;
}

async function removeExistingCalibrationData() {
  await datamartKnex('data_scoring_meshes').truncate();
  await datamartKnex('data_scoring_meshes_all').truncate();
  await datamartKnex('data_scoring_thresholds').truncate();
  await datamartKnex('data_scoring_thresholds_all').truncate();
  await datamartKnex('data_active_calibrated_challenges').truncate();
  await datamartKnex('data_calibrations').truncate();
}

export async function seed() {
  if (!config.seeds.context.certification) {
    logger.info('Certification seeds are disabled, skipping calibrations');
    return;
  }

  await removeExistingCalibrationData();

  const calibrationDate = dayjs().subtract(CALIBRATION_AGE_IN_MONTHS, 'month').toDate();
  let seededCalibrationCount = 0;

  for (const [index, calibrationScope] of Object.values(CALIBRATION_SCOPES).entries()) {
    const version = await findActiveVersion({ calibrationScope });

    if (!version) {
      logger.warn(`No active certification version for scope ${calibrationScope}, skipping its calibration`);
      continue;
    }

    const { id: versionId, globalScoringConfiguration, competencesScoringConfiguration } = version;
    const challengeIds = await findChallengeIdsToCalibrate({ versionId });

    if (challengeIds.length === 0) {
      logger.warn(
        `No validated challenge for scope ${calibrationScope} (version ${versionId}), skipping its calibration`,
      );
      continue;
    }

    const calibrationId = index + 1;
    await datamartKnex('data_calibrations').insert({
      id: calibrationId,
      calibration_date: calibrationDate,
      scope: calibrationScope,
      status: CALIBRATION_STATUSES.VALIDATED,
    });

    await datamartKnex.batchInsert(
      'data_active_calibrated_challenges',
      challengeIds.map((challengeId) => ({
        calibration_id: calibrationId,
        challenge_id: challengeId,
        alpha: ALPHA,
        delta: DELTA,
      })),
    );

    seededCalibrationCount++;
    logger.info(
      `Seeded calibration ${calibrationId} (${calibrationScope}) with ${challengeIds.length} calibrated challenges`,
    );

    if (!globalScoringConfiguration?.length) {
      logger.warn(
        `No global scoring configuration for scope ${calibrationScope} (version ${versionId}), skipping its scoring meshes and thresholds`,
      );
      continue;
    }

    const meshCount = await seedScoringMeshes({ calibrationId, globalScoringConfiguration });
    logger.info(`Seeded ${meshCount} scoring meshes for calibration ${calibrationId} (${calibrationScope})`);

    // Only the core scope defines capacity bounds per competence: `competencesScoringConfiguration` is null
    // for every Pix+ version.
    if (competencesScoringConfiguration?.length) {
      const thresholdCount = await seedScoringThresholds({
        calibrationId,
        capacityBounds: getCapacityBounds(globalScoringConfiguration),
        competencesScoringConfiguration,
      });
      logger.info(`Seeded ${thresholdCount} scoring thresholds for calibration ${calibrationId} (${calibrationScope})`);
    }
  }

  if (seededCalibrationCount === 0) {
    logger.warn(
      'No calibration seeded: the API database holds no calibratable certification version. Run `npm run db:seed` then `npm run datamart:seed:calibrations`.',
    );
  }
}
