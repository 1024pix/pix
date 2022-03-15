const paginateModule = require('../../infrastructure/utils/paginate');

module.exports = async function findPaginatedRecommendedTutorials({ userId, tutorialRepository, page, locale }) {
  const tutorials = await tutorialRepository.findRecommendedByUserId({ userId, locale });
  return paginateModule.paginate(tutorials, page);
};
