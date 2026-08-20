import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { SmartRandomChallenge } from '../../domain/models/SmartRandomChallenge.js';

export async function findValidatedByCompetenceId(competenceId, locale) {
  const lcmsChallenges = await challengeRepository.findValidatedChallengeDtosByCompetenceId(competenceId, locale);
  return lcmsChallenges.map((lcmsChallenge) => new SmartRandomChallenge(lcmsChallenge));
}

export async function findOperativeBySkillsAndLocales(skills, locales) {
  const lcmsChallenges = await challengeRepository.findOperativeChallengeDtosBySkillsAndLocales(skills, locales);
  return lcmsChallenges.map((lcmsChallenge) => new SmartRandomChallenge(lcmsChallenge));
}
