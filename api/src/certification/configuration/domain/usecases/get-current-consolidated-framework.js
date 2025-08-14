import * as injectedConsolidatedFrameworkRepository from '../../infrastructure/repositories/consolidated-framework-repository.js';
import * as injectedLearningContentRepository from '../../infrastructure/repositories/learning-content-repository.js'; /**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 * @typedef {import ('./index.js').ConsolidatedFrameworkRepository} ConsolidatedFrameworkRepository
 * @typedef {import ('./index.js').LearningContentRepository} LearningContentRepository
 */

/**
 * @param {Object} params
 * @param {ComplementaryCertificationKeys} params.complementaryCertificationKey
 * @param {ConsolidatedFrameworkRepository} params.consolidatedFrameworkRepository
 * @param {LearningContentRepository} params.learningContentRepository
 */
export const getCurrentConsolidatedFramework = async ({
  complementaryCertificationKey,
  consolidatedFrameworkRepository = injectedConsolidatedFrameworkRepository,
  learningContentRepository = injectedLearningContentRepository,
} = {}) => {
  const currentConsolidatedFramework =
    await consolidatedFrameworkRepository.getCurrentFrameworkByComplementaryCertificationKey({
      complementaryCertificationKey,
    });

  const frameworkAreas = await learningContentRepository.getFrameworkReferential({
    challengeIds: currentConsolidatedFramework.challenges.map(({ challengeId }) => challengeId),
  });

  return { ...currentConsolidatedFramework, areas: frameworkAreas };
};
