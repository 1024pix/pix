import { repositories as injectedRepositories } from '../../../shared/infrastructure/repositories/index.js';

const findFilteredMostRecentKnowledgeElementsByUser = async ({
  userId,
  skillIds = [],
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
} = {}) => knowledgeElementRepository.findUniqByUserId({ userId, skillIds });

export { findFilteredMostRecentKnowledgeElementsByUser };
