module.exports = async function getUserPixScore({ userId, knowledgeElementRepository }) {
  const userPixScore = await knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(userId);
  return { id: userId, value: userPixScore };
};
