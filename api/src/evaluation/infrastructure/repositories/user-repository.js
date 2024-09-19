/**
 * @typedef {import ('./index.js').UserApi} UserApi
 */

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 */
const update = async function ({ userId, userApi }) {
  return userApi.markLevelSevenInfoAsSeen({ userId });
};

export { update };
