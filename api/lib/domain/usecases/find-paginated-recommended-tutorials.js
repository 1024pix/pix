module.exports = async function findPaginatedRecommendedTutorials({ userId, tutorialRepository, page, locale }) {
  return tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId, page, locale });
};
