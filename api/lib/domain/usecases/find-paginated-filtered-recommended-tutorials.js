module.exports = async function findPaginatedFilteredRecommendedTutorials({
  userId,
  filters,
  page,
  locale,
  tutorialRepository,
}) {
  return tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId, filters, page, locale });
};
