import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
export async function getChallenge({ id, challengeRepository = injectedChallengeRepository } = {}) {
  return challengeRepository.get(id);
}
