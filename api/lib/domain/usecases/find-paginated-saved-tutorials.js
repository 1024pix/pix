module.exports = async function findPaginatedSavedTutorials({ userId, filters, page, tutorialRepository } = {}) {
  const { models: results, meta } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
    userId,
    filters,
    page,
  });
  return {
    results,
    meta,
  };
};
