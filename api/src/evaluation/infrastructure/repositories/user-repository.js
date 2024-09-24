/**
 * @typedef {import ('./index.js').UserApi} UserApi
 */

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 */
const updateMarkLevelSevenInfoAsSeen = async function ({ userId, userApi }) {
  return userApi.markLevelSevenInfoAsSeen({ userId });
};

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 * @param {number} params.userId
 */
const updateHasSeenNewDashboardInfo = async function ({ userId, userApi }) {
  return userApi.markNewDashboardInfoAsSeen({ userId });
};

export { updateHasSeenNewDashboardInfo, updateMarkLevelSevenInfoAsSeen };
