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
 * @returns {Promise<number|undefined>}
 */
async function findActiveVersionId({ calibrationScope }) {
  const version = await apiKnex('certification_versions')
    .select('id')
    .where({ scope: fromCalibrationScope(calibrationScope), status: VERSION_STATUSES.ACTIVE })
    .orderBy('id', 'desc')
    .first();

  return version?.id;
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

async function removeExistingCalibrations() {
  await datamartKnex('data_active_calibrated_challenges').truncate();
  await datamartKnex('data_calibrations').truncate();
}

export async function seed() {
  if (!config.seeds.context.certification) {
    logger.info('Certification seeds are disabled, skipping calibrations');
    return;
  }

  await removeExistingCalibrations();

  const calibrationDate = dayjs().subtract(CALIBRATION_AGE_IN_MONTHS, 'month').toDate();
  let seededCalibrationCount = 0;

  for (const [index, calibrationScope] of Object.values(CALIBRATION_SCOPES).entries()) {
    const versionId = await findActiveVersionId({ calibrationScope });

    if (!versionId) {
      logger.warn(`No active certification version for scope ${calibrationScope}, skipping its calibration`);
      continue;
    }

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
  }

  if (seededCalibrationCount === 0) {
    logger.warn(
      'No calibration seeded: the API database holds no calibratable certification version. Run `npm run db:seed` then `npm run datamart:seed:calibrations`.',
    );
  }
}
