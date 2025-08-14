import * as injectedUserApi from '../../../identity-access-management/application/api/users-api.js';/**
 * @typedef {import ('./index.js').UserApi} UserApi
 */

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 * @param {number} params.userId
 */
const updateHasSeenNewDashboardInfo = async function({ userId, userApi = injectedUserApi } = {}) {
  return userApi.markNewDashboardInfoAsSeen({ userId });
};

/**
 * @function
 * @param {Object} params
 * @param {UserApi} params.userApi
 * @param {number} params.userId
 */
const updateAssessmentInstructionsInfoAsSeen = async function({ userId, userApi = injectedUserApi } = {}) {
  return userApi.markAssessmentInstructionsInfoAsSeen({ userId });
};

export { updateAssessmentInstructionsInfoAsSeen, updateHasSeenNewDashboardInfo };
