import { NotFoundError } from '../../../../shared/domain/errors.js';
import { buildReport } from '../models/CalibrationReport.js';

export async function generateCalibrationReportCheck({
  versionId,
  calibrationId,
  versionRepository,
  calibrationRepository,
}) {
  const version = await versionRepository.getById({ id: versionId });
  if (!version) {
    throw new NotFoundError(`Cannot find version of id "${versionId}"`);
  }

  const calibration = await calibrationRepository.findForReport(calibrationId);
  if (!calibration) {
    throw new NotFoundError(`Cannot find calibration of external id "${calibrationId}"`);
  }

  return buildReport({ version, calibration });
}
