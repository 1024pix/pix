/**
 * @typedef {import ('../../../shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import ('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { CertificationVersionDraftAlreadyExistError } from '../errors.js';
import { CertificationFrameworksChallenge } from '../models/CertificationFrameworksChallenge.js';
import { Version } from '../models/Version.js';

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
  const allVersions = await versionRepository.findAllByScope({ scope });
  const hasDraft = allVersions.some((version) => version.isDraft);
  if (hasDraft) {
    throw new CertificationVersionDraftAlreadyExistError();
  }

  const activeVersion = allVersions.find((version) => version.isActive);
  const locales = scope === SCOPES.CORE ? [FRENCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_FRANCE] : [FRENCH_FRANCE];
  const challengeIds = await challengeRepository.findValidatedIdsByTubeIdsAndLocales(tubeIds, locales);

  const draftVersion = Version.buildDraftFromActiveVersion({
    scope,
    version: activeVersion,
  });

  let draftVersionId;
  await DomainTransaction.execute(async () => {
    draftVersionId = await versionRepository.create(draftVersion);
    const certificationChallenges = challengeIds.map(
      (challengeId) =>
        new CertificationFrameworksChallenge({
          versionId: draftVersionId,
          challengeId,
          discriminant: null,
          difficulty: null,
        }),
    );
    await frameworkChallengesRepository.create(certificationChallenges);
  });

  return draftVersionId;
}
