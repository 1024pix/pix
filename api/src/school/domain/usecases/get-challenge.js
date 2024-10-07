import { challengeService } from '../services/challenge.js';

export async function getChallenge({ id, challengeRepository }) {
  const challenge = await challengeRepository.get(id);
  return challengeService.mapChallenge(challenge);
}
