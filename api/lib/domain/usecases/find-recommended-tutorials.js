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

  const skills = await Promise.all(
    invalidatedKnowledgeElements.map((invalidatedKnowledgeElement) => {
      return skillRepository.get(invalidatedKnowledgeElement.skillId);
    })
  );

  const tutorials = await Promise.all(
    skills.map((skill) => {
      return tutorialRepository.findByRecordIds(skill.tutorialIds);
    })
  );

  return tutorials.flat();
};
