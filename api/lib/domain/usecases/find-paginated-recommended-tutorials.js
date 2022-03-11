const paginate = require('../../infrastructure/utils/paginate');

/** @typedef {import('../../infrastructure/utils/paginate').PageInput} PageInput */
/** @typedef {import('../../infrastructure/utils/paginate').Page} Page */

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {Object} params.tutorialRepository
 * @param {PageInput} params.page
 * @returns {Promise<Page>}
 */
module.exports = async function findPaginatedRecommendedTutorials({ userId, tutorialRepository, page }) {
  const tutorials = await tutorialRepository.findRecommendedByUserId(userId);

  return paginate(tutorials, page);
};
