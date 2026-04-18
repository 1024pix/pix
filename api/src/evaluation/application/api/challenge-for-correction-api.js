import * as challengeForCorrectionRepository from '../../infrastructure/repositories/challenge-for-correction-repository.js';

/**
 * @function
 * @name get
 *
 * @param {string} challengeId
 * @returns {Promise<ChallengeForCorrection>}
 */
export function get(challengeId) {
  return challengeForCorrectionRepository.get(challengeId);
}
