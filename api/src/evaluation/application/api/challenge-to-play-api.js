import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';
import { challengeToPlaySerializer } from '../../infrastructure/serializers/jsonapi/challenge-to-play-serializer.js';

/**
 * @function
 * @name get
 *
 * @param {string} challengeId
 * @returns {Promise<ChallengeToPlay>}
 */
export function get(challengeId) {
  return challengeToPlayRepository.get(challengeId);
}

/**
 * @function
 * @name getSerializationConfig
 *
 * @returns {Object} Config for JSON-API serialization of a ChallengeToPlay
 */
export function getSerializationConfig() {
  return challengeToPlaySerializer.config;
}
