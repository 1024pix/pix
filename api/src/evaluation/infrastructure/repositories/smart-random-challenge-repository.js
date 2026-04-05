import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { SmartRandomChallenge } from '../../domain/models/SmartRandomChallenge.js';

/**
 *
 * @param {string} competenceId
 * @param {string} locale
 * @returns {Promise<SmartRandomChallenge[]>}
 */
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

/**
 *
 * @param {SmartRandomSkill[]} skills
 * @param {string[]} locales
 * @returns {Promise<SmartRandomChallenge[]>}
 */
export async function findOperativeBySkillsAndLocales(skills, locales) {
  const lcmsChallenges = await challengeRepository.findOperativeBySkillsAndLocales_proxy(skills, locales);
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
