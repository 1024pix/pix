/**
 * @param {Object} page custom pagination properties
 * @param {number} page.size pagination items per page
 * @param {number} page.number current pagination page
 * @param autonomousCourseRepository
 *
 * @returns {Promise<{autonomousCourses: Array<CampaignListItem>, meta: { page: number, pageSize: number, rowCount: number, pageCount: number} }>} returns a paginated list of autonomous courses
 */
const findAllPaginatedAutonomousCourses = async ({ page, autonomousCourseRepository }) => {
  return autonomousCourseRepository.findAllPaginated({ page });
};

export { findAllPaginatedAutonomousCourses };
