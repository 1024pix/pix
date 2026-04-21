/**
 * @param {Object} params
 * @param {string} params.filter - Filter criteria for users
 * @param {number} params.page - Page number for pagination
 * @param {string} params.queryType - Type of query to execute
 * @param {UserRepository} params.userRepository
 * @returns {Promise<{data: User[], meta: {total: number}}>}
 */
const findPaginatedFilteredUsers = function ({ filter, page, queryType, userRepository }) {
  return userRepository.findPaginatedFiltered({ filter, page, queryType });
};

export { findPaginatedFilteredUsers };
