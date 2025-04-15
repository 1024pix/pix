import { usecases } from '../../domain/usecases/index.js';
import { UserDTO } from './models/UserDTO.js';
/**
 * @module UserApi
 */

/**
 * @function
 * @name markNewDashboardInfoAsSeen
 *
 * @param {Object} params
 * @param {Number} params.userId
 * @returns {Promise}
 */
export const markNewDashboardInfoAsSeen = async ({ userId }) => {
  return usecases.markUserHasSeenNewDashboardInfo({ userId });
};

/**
 * @function
 * @name markAssessmentInstructionsInfoAsSeen
 *
 * @param {Object} params
 * @param {Number} params.userId
 * @returns {Promise}
 */
export const markAssessmentInstructionsInfoAsSeen = async ({ userId }) => {
  return usecases.markAssessmentInstructionsInfoAsSeen({ userId });
};

/**
 * @function
 * @name getActiveByUserIds
 *
 * @param {Object} params
 * @param {Array<Number>} params.userIds
 * @returns {Promise<Array<UserDTO>>}
 */
export const getActiveByUserIds = async ({ userIds }) => {
  const users = await usecases.getActiveByUserIds({ userIds });

  return users.map((user) => new UserDTO(user));
};
