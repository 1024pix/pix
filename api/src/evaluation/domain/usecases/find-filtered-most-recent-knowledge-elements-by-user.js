const findFilteredMostRecentKnowledgeElementsByUser = async ({
  userId,
  skillIds = [],
  knowledgeElementRepository,
} = {}) => knowledgeElementRepository.findUniqByUserId({ userId, skillIds });

export { findFilteredMostRecentKnowledgeElementsByUser };
