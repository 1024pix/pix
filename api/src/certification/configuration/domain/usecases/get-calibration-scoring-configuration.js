/**
 * @typedef {import ('./index.js').CalibrationRepository} CalibrationRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CalibrationScoringConfiguration } from '../read-models/CalibrationScoringConfiguration.js';

/**
 * @param {object} params
 * @param {number} params.calibrationId
 * @param {CalibrationRepository} params.calibrationRepository
 * @returns {Promise<CalibrationScoringConfiguration>}
 */
export async function getCalibrationScoringConfiguration({ calibrationId, calibrationRepository }) {
  const calibration = await calibrationRepository.find(calibrationId);
  if (!calibration) {
    throw new NotFoundError(`Cannot find calibration of external id "${calibrationId}"`);
  }

  return CalibrationScoringConfiguration.fromCalibration({ calibration });
}
