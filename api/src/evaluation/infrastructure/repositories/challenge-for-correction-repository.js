import * as solutionAdapter from '../../../shared/infrastructure/adapters/solution-adapter.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { ChallengeForCorrection } from '../../domain/models/ChallengeForCorrection.js';

export async function get(challengeId) {
  const challenge = await challengeRepository.get_proxy(challengeId);
  const solutionAlgo = solutionAdapter.fromChallenge(challenge);
  return new ChallengeForCorrection(challenge, solutionAlgo);
}
