import { usecases } from '../../../enrolment/domain/usecases/index.js';

/**
 * Checks if a user has been candidate to a certification
 *
 * @function
 * @param {object} params
 * @param {number} params.userId user id to search for candidates
 * @returns {Promise<boolean>}
 * @throws {TypeError} preconditions failed
 */
export async function hasBeenCandidate({ userId }) {
  if (!userId) {
    throw new TypeError('user identifier is required');
  }
  return usecases.hasBeenCandidate({ userId });
}
