/**
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { CertificationVersionForbiddenDeletionError } from '../errors.js';
import { VERSION_STATUSES } from '../models/Version.js';

/**
 * @param {object} params
 * @param {number} params.certificationVersionId
 * @param {VersionRepository} params.versionRepository
 */

export async function deleteCertificationVersion({ certificationVersionId, versionRepository }) {
  const version = await versionRepository.getById({ id: certificationVersionId });
  if (version.status === VERSION_STATUSES.ACTIVE) {
    throw new CertificationVersionForbiddenDeletionError();
  }
  await versionRepository.deleteVersion(certificationVersionId);
}
