import { usecases } from '../../domain/usecases/index.js';

/**
 * @function
 * @param {Object} params
 * @param {number} params.certificationCenterId
 * @param {date} params.archiveDate
 * @param {number} params.archivedBy
 */
export async function archiveCertificationCenterData({ certificationCenterId, archiveDate, archivedBy }) {
  await usecases.archiveCertificationCenterData({ certificationCenterId, archiveDate, archivedBy });
}
