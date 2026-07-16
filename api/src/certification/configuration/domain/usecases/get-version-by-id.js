/**
 * @typedef {import('../../domain/models/Version.js').Version} Version
 * @typedef {import ('./index.js').VersionDetailsRepository} VersionDetailsRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {VersionDetailsRepository} params.versionDetailsRepository
 */
export async function getVersionById({ id, versionDetailsRepository }) {
  const versionDetails = await versionDetailsRepository.getById(id);

  if (!versionDetails) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  return versionDetails;
}
