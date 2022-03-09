const paginate = require('../../infrastructure/utils/paginate');

module.exports = async function findPaginatedRecommendedTutorials({
  userId,
  knowledgeElementRepository,
  skillRepository,
  tutorialRepository,
  page,
}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));

  const tutorials = await tutorialRepository.findByRecordIds(skills.flatMap((skill) => skill.tutorialIds));

  return paginate(tutorials, page);
};
