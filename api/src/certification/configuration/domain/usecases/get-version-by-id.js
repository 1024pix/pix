/**
 * @typedef {import('../../domain/models/Version.js').Version} Version
 * @typedef {import ('./index.js').FrameworkChallengesRepository} FrameworkChallengesRepository
 * @typedef {import ('./index.js').LearningContentRepository} LearningContentRepository
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {FrameworkChallengesRepository} params.frameworkChallengesRepository
 * @param {LearningContentRepository} params.learningContentRepository
 * @param {VersionRepository} params.versionRepository
 */
export async function getVersionById({
  id,
  frameworkChallengesRepository,
  learningContentRepository,
  versionRepository,
}) {
  const version = await versionRepository.getById({ id });

  if (!version) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  const challenges = await frameworkChallengesRepository.getByVersionId({
    versionId: version.id,
  });

  const frameworkAreas = await learningContentRepository.getFrameworkReferential({
    challengeIds: challenges.map(({ challengeId }) => challengeId),
  });

  return {
    version,
    areas: frameworkAreas,
  };
}
