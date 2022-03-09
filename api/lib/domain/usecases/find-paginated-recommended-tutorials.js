module.exports = async function findPaginatedRecommendedTutorials({
  userId,
  knowledgeElementRepository,
  skillRepository,
  tutorialRepository,
  page: { size: pageSize = 10, number: pageNumber = 1 } = {},
}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId(userId);

  if (!invalidatedKnowledgeElements.length) {
    return {
      results: [],
      pagination: {
        page: pageNumber,
        pageSize: pageSize,
        rowCount: 0,
        pageCount: 0,
      },
    };
  }

  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));

  const tutorials = await tutorialRepository.findByRecordIds(skills.flatMap((skill) => skill.tutorialIds));

  return {
    results: tutorials.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    pagination: {
      page: pageNumber,
      pageSize: pageSize,
      rowCount: tutorials.length,
      pageCount: Math.ceil(tutorials.length / pageSize),
    },
  };
};
