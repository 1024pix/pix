/**
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationVersionDraftAlreadyExistError } from '../errors.js';
import { Version } from '../models/Version.js';

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @param {Array<string>} params.tubeIds
 * @param {VersionRepository} params.versionRepository
 * @returns {Promise<number>} ID of created version
 */
export async function createDraft({ scope, tubeIds, versionRepository }) {
  const allVersions = await versionRepository.findAllByScope({ scope });
  const hasDraft = allVersions.some((version) => version.isDraft);
  if (hasDraft) {
    throw new CertificationVersionDraftAlreadyExistError();
  }

  const activeVersion = allVersions.find((version) => version.isActive);

  const draftVersion = Version.buildDraftFromActiveVersion({
    scope,
    version: activeVersion,
    tubeIds,
  });

  const versionId = await DomainTransaction.execute(async () => {
    return versionRepository.create(draftVersion);
  });

  return versionId;
}
