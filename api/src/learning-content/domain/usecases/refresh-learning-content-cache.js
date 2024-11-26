import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

export const refreshLearningContentCache = withTransaction(
  /** @param {import('./dependencies.js').Dependencies} */
  async function refreshLearningContentCache({ LearningContentCache, frameworkRepository }) {
    const learningContent = await LearningContentCache.instance.reset();

    await frameworkRepository.save(learningContent.frameworks);
  },
);
