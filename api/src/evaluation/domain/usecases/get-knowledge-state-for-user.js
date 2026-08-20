const getKnowledgeStateForUser = async ({ userId, knowledgeStateRepository } = {}) =>
  knowledgeStateRepository.findByUserId({ userId });

export { getKnowledgeStateForUser };
