import { BaseChallenge } from '../../domain/models/BaseChallenge.js';
import * as challengeRepository from './challenge-repository.js';

export async function findOperativeBySkills(skills, locale) {
  const challenges = await challengeRepository.findOperativeBySkills_proxy(skills, locale);
  return challenges.map((challenge) => new BaseChallenge(challenge));
}
