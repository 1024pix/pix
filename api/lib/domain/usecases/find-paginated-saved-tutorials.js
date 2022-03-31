module.exports = async function findPaginatedSavedTutorials({ tutorialRepository, userId, page } = {}) {
  const { models: results, meta } = await tutorialRepository.findPaginatedForCurrentUser({
    userId,
    page,
  });
  return {
    results,
    meta,
  };
};
