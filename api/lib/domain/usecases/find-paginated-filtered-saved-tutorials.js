module.exports = async function findPaginatedFilteredSavedTutorials({
  userId,
  filters,
  page,
  tutorialRepository,
} = {}) {
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
