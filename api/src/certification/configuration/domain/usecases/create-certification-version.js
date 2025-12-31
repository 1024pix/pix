/**
 * @typedef {import ('../../../shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import ('./index.js').TubeRepository} TubeRepository
 * @typedef {import ('./index.js').SkillRepository} SkillRepository
 * @typedef {import ('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import ('./index.js').VersionsRepository} VersionsRepository
 */

import dayjs from 'dayjs';

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { FRENCH_FRANCE, FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import {
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../shared/domain/constants.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Version } from '../models/Version.js';

export const createCertificationVersion = withTransaction(
  /**
   * @param {object} params
   * @param {SCOPES} params.scope
   * @param {Array<string>} params.tubeIds
   * @param {TubeRepository} params.tubeRepository
   * @param {SkillRepository} params.skillRepository
   * @param {ChallengeRepository} params.challengeRepository
   * @param {VersionsRepository} params.versionsRepository
   */
  async ({ scope, tubeIds, tubeRepository, skillRepository, challengeRepository, versionsRepository }) => {
    const version = await _buildNewVersion({ scope, versionsRepository });
    const challenges = await _getChallengesForTubes({ tubeIds, tubeRepository, skillRepository, challengeRepository });
    return versionsRepository.create({ version, challenges });
  },
);

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @param {VersionsRepository} params.versionsRepository
 */
const _buildNewVersion = async ({ scope, versionsRepository }) => {
  const currentVersion = await versionsRepository.findActiveByScope({ scope });

  if (!currentVersion) {
    return new Version({
      scope,
      startDate: dayjs().toDate(),
      expirationDate: null,
      assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
      challengesConfiguration: new FlashAssessmentAlgorithmConfiguration({
        challengesBetweenSameCompetence: 0,
        maximumAssessmentLength: 32,
        variationPercent: 1,
        defaultCandidateCapacity: 0,
        defaultProbabilityToPickChallenge: DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
      }),
    });
  }

  const transitionDate = dayjs().toDate();

  const expiredVersion = new Version({
    ...currentVersion,
    expirationDate: transitionDate,
  });
  await versionsRepository.update({ version: expiredVersion });

  return new Version({
    scope,
    startDate: transitionDate,
    expirationDate: null,
    assessmentDuration: currentVersion.assessmentDuration,
    challengesConfiguration: currentVersion.challengesConfiguration,
  });
};

/**
 * @param {object} params
 * @param {Array<string>} params.tubeIds
 * @param {TubeRepository} params.tubeRepository
 * @param {SkillRepository} params.skillRepository
 * @param {ChallengeRepository} params.challengeRepository
 */
const _getChallengesForTubes = async ({ tubeIds, tubeRepository, skillRepository, challengeRepository }) => {
  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds, FRENCH_SPOKEN);
  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  const skills = await skillRepository.findActiveByRecordIds(skillIds);
  return challengeRepository.findValidatedBySkills(skills, FRENCH_FRANCE);
};
