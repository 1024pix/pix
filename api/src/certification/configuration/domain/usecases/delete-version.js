/**
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { CertificationVersionForbiddenDeletionError } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {VersionRepository} params.versionRepository
 */

export async function deleteVersion({ id, versionRepository }) {
  const version = await versionRepository.getById({ id });
  if (!version.canRemove) {
    throw new CertificationVersionForbiddenDeletionError();
  }
  await versionRepository.remove(id);
}
