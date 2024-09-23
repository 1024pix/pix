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

export { updateMarkLevelSevenInfoAsSeen };
