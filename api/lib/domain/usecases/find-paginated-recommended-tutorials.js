module.exports = async function findPaginatedRecommendedTutorials({ userId, tutorialRepository, page, locale }) {
  return tutorialRepository.findPaginatedRecommendedByUserId({ userId, page, locale });
};
