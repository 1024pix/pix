module.exports = async function findPaginatedRecommendedTutorials({
  userId,
  filters,
  page,
  locale,
  tutorialRepository,
}) {
  return tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId, filters, page, locale });
};
