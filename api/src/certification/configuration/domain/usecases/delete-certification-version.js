/**
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { CertificationVersionForbiddenDeletionError } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.certificationVersionId
 * @param {VersionRepository} params.versionRepository
 */

export async function deleteCertificationVersion({ certificationVersionId, versionRepository }) {
  const version = await versionRepository.getById({ id: certificationVersionId });
  if (!version.canRemove) {
    throw new CertificationVersionForbiddenDeletionError();
  }
  await versionRepository.remove(certificationVersionId);
}
