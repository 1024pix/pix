import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { SmartRandomChallenge } from '../../domain/models/SmartRandomChallenge.js';

export async function findValidatedByCompetenceId(competenceId, locale) {
  const lcmsChallenges = await challengeRepository.findValidatedByCompetenceId_proxy(competenceId, locale);
  return lcmsChallenges.map(
    (lcmsChallenge) =>
      new SmartRandomChallenge({
        id: lcmsChallenge.id,
        locales: lcmsChallenge.locales,
        status: lcmsChallenge.status,
        skillId: lcmsChallenge.skillId,
        timer: lcmsChallenge.timer,
      }),
  );
}
