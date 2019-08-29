module.exports = async ({ userId, knowledgeElementRepository }) => {
  const userPixScore = await knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(userId);
  return { id: userId, value: userPixScore };
};
