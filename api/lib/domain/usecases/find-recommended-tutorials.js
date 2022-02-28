module.exports = async function findRecommendedTutorials({
  userId,
  knowledgeElementRepository,
  skillRepository,
  tutorialRepository,
}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

  if (!invalidatedKnowledgeElements.length) {
    return [];
  }

  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));

  const tutorials = await Promise.all(skills.map((skill) => tutorialRepository.findByRecordIds(skill.tutorialIds)));

  return tutorials.flat();
};
