/**
 * @typedef {import('../../domain/errors.js').SessionStartedDeletionError} SessionStartedDeletionError
 */

import { usecases } from '../../../enrolment/domain/usecases/index.js';

/**
 * @function
 * @name update
 *
 * @param {Object} params
 * @param {number} params.sessionId session to delete
 * @returns {void}
 * @throws {SessionStartedDeletionError} session could not be deleted since it has ongoing certifications
 */
export const deleteSession = async ({ sessionId }) => {
  if (!sessionId) {
    throw new TypeError('session identifier is required');
  }
  return usecases.deleteSession({ sessionId });
};
