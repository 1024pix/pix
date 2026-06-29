/**
 * @typedef {import('../../domain/models/Version.js').Version} Version
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {string} params.comments
 * @param {VersionRepository} params.versionRepository
 */
export async function updateVersion({ id, comments, versionRepository }) {
  const version = await versionRepository.getById({ id });

  if (!version) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  version.update({ comments });
  return versionRepository.update({ version });
}
