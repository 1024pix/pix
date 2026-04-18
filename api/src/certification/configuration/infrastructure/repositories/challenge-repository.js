import { FRENCH_FRANCE } from '../../../../shared/domain/services/locale-service.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { Challenge } from '../../domain/models/Challenge.js';

export async function findValidatedBySkills(skills) {
  const challenges = await challengeRepository.findValidatedBySkills(skills, FRENCH_FRANCE);
  return challenges.map((challenge) => new Challenge(challenge));
}
