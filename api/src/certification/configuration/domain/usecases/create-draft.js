/**
 * @typedef {import ('../../../shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import ('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { CertificationVersionDraftAlreadyExistError } from '../errors.js';
import { Version } from '../models/Version.js';
import { FRAMEWORK_HISTORY_STATUSES } from '../read-models/FrameworkHistoryEntry.js';

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @param {Array<string>} params.tubeIds
 * @param {ChallengeRepository} params.challengeRepository
 * @param {VersionRepository} params.versionRepository
 */
export async function createDraft({
  scope,
  tubeIds,
  challengeRepository,
  versionRepository,
  frameworkChallengesRepository,
}) {
  const allVersions = await versionRepository.findAll();
  const scopeVersions = allVersions.filter((version) => version.scope === scope);
  const hasDraft = scopeVersions.some((version) => version.status === FRAMEWORK_HISTORY_STATUSES.DRAFT);
  if (hasDraft) {
    throw new CertificationVersionDraftAlreadyExistError();
  }

  const activeVersion = scopeVersions.some((version) => version.status === FRAMEWORK_HISTORY_STATUSES.ACTIVE);
  const locales = scope === SCOPES.CORE ? [FRENCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_FRANCE] : [FRENCH_FRANCE];
  const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(tubeIds, locales);

  const version = Version.buildFromVersion({
    scope,
    version: activeVersion,
  });

  let createdVersion;
  await DomainTransaction.execute(async () => {
    createdVersion = await versionRepository.create({ version, challengeIds });
    await frameworkChallengesRepository.createFromChallengeIds({ versionId: createdVersion.id, challengeIds });
  });

  return createdVersion;
}
