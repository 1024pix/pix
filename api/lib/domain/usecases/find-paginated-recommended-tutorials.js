const paginateModule = require('../../infrastructure/utils/paginate');

module.exports = async function findPaginatedRecommendedTutorials({ userId, tutorialRepository, page }) {
  const tutorials = await tutorialRepository.findRecommendedByUserId(userId);
  return paginateModule.paginate(tutorials, page);
};
