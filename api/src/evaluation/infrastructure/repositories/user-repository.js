/**
 * @typedef {import ("./index.js").UserApi} UserApi
 */

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 * @param {number} params.userId
 */
const updateHasSeenNewDashboardInfo = async function ({ userId, userApi }) {
  return userApi.markNewDashboardInfoAsSeen({ userId });
};

export { updateHasSeenNewDashboardInfo };
