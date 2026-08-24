/**
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 * @typedef {import ('./index.js').CalibrationRepository} CalibrationRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CalibrationScoringConfiguration } from '../read-models/CalibrationScoringConfiguration.js';

/**
 * Returns the global scoring configuration proposed by a calibration, to seed the scoring form of a
 * draft version. An unavailable configuration is a nominal answer, not an error: Data delivers the
 * scoring meshes after the calibration itself, and never delivers them for some scopes.
 *
 * @param {object} params
 * @param {number} params.versionId
 * @param {number} params.calibrationId
 * @param {VersionRepository} params.versionRepository
 * @param {CalibrationRepository} params.calibrationRepository
 * @returns {Promise<CalibrationScoringConfiguration>}
 */
export async function getCalibrationScoringConfiguration({
  versionId,
  calibrationId,
  versionRepository,
  calibrationRepository,
}) {
  const version = await versionRepository.getById({ id: versionId });
  if (!version) {
    throw new NotFoundError(`Cannot find version of id "${versionId}"`);
  }

  const calibration = await calibrationRepository.find(calibrationId);
  if (!calibration) {
    throw new NotFoundError(`Cannot find calibration of external id "${calibrationId}"`);
  }

  return CalibrationScoringConfiguration.fromCalibration({ versionId, calibration });
}
