import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';

/**
 * @function
 * @name get
 *
 * @param {string} challengeId
 * @returns {Promise<ChallengeToPlay>} corrected answer
 */
export function get(challengeId) {
  return challengeToPlayRepository.get(challengeId);
}

/**
 * @function
 * @name serialize
 *
 * @param {ChallengeToPlay} challengeToPlay
 * @returns {Object} JSON-API serialization of a ChallengeToPlay
 */
export function serialize(challengeToPlay) {
  return challengeSerializer.serialize(challengeToPlay);
}
