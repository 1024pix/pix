import { NotFoundError } from '../../../../shared/domain/errors.js';
import { buildReport } from '../models/CalibrationReport.js';

export async function generateCalibrationReportCheck({ versionId, versionRepository, calibrationRepository }) {
  const version = await versionRepository.getById({ id: versionId });
  if (!version) {
    throw new NotFoundError(`Cannot find version of id "${versionId}"`);
  }

  const calibration = await calibrationRepository.findLatestForReport({ scope: version.scope });
  if (!calibration) {
    throw new NotFoundError(`Cannot find any calibration for scope "${version.scope}"`);
  }

  return buildReport({ version, calibration });
}
