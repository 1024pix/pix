import * as learnersApi from '../../../prescription/learner-management/application/api/learners-api.js';

/**
 * Checks if the user has been a learner.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {Object} [params.dependencies] - The dependencies.
 * @param {Object} [params.dependencies.learnersApi] - The learners API.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has been a learner.
 */
const hasBeenLearner = async ({ userId, dependencies = { learnersApi } }) => {
  return dependencies.learnersApi.hasBeenLearner({ userId });
};

export { hasBeenLearner };
