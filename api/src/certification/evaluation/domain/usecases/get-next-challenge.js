/**
 * @typedef {import('../../../session-management/domain/usecases/index.js').AnswerRepository} AnswerRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').SessionManagementCertificationChallengeRepository} SessionManagementCertificationChallengeRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').FlashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {import('../../../evaluation/domain/usecases/index.js').PickChallengeService} PickChallengeService
 * @typedef {import('../../../session-management/domain/usecases/index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 */

import Debug from 'debug';

import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { CertificationChallenge } from '../../../../shared/domain/models/CertificationChallenge.js';
import { answerRepository as injectedAnswerRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { certificationChallengeRepository as injectedSessionManagementCertificationChallengeRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { challengeRepository as injectedSharedChallengeRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { flashAlgorithmConfigurationRepository as injectedFlashAlgorithmConfigurationRepository } from '../../../session-management/infrastructure/repositories/index.js';
import * as injectedCertificationChallengeLiveAlertRepository from '../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedCertificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';
import * as injectedFlashAlgorithmService from '../services/algorithm-methods/flash.js';
import injectedPickChallengeService from '../services/pick-challenge-service.js';

const debugGetNextChallengeForV3Certification = Debug('pix:certif:v3:get-next-challenge');

/**
 * @param {Object} params
 * @param {AnswerRepository} params.answerRepository
 * @param {SessionManagementCertificationChallengeRepository} params.sessionManagementCertificationChallengeRepository
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {ChallengeRepository} params.sharedChallengeRepository
 * @param {FlashAlgorithmConfigurationRepository} params.flashAlgorithmConfigurationRepository
 * @param {FlashAlgorithmService} params.flashAlgorithmService
 * @param {PickChallengeService} params.pickChallengeService
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 */
const getNextChallenge = async function ({
  assessment,
  answerRepository = injectedAnswerRepository,
  sessionManagementCertificationChallengeRepository = injectedSessionManagementCertificationChallengeRepository,
  certificationChallengeLiveAlertRepository = injectedCertificationChallengeLiveAlertRepository,
  certificationCourseRepository = injectedCertificationCourseRepository,
  sharedChallengeRepository = injectedSharedChallengeRepository,
  flashAlgorithmConfigurationRepository = injectedFlashAlgorithmConfigurationRepository,
  flashAlgorithmService = injectedFlashAlgorithmService,
  locale,
  pickChallengeService = injectedPickChallengeService,
  certificationCandidateRepository = injectedCertificationCandidateRepository,
} = {}) {
  const certificationCourse = await certificationCourseRepository.get({ id: assessment.certificationCourseId });

  const validatedLiveAlertChallengeIds = await _getValidatedLiveAlertChallengeIds({
    assessmentId: assessment.id,
    certificationChallengeLiveAlertRepository,
  });

  const allAnswers = await answerRepository.findByAssessmentExcludingChallengeIds({
    assessmentId: assessment.id,
    excludedChallengeIds: validatedLiveAlertChallengeIds,
  });

  const alreadyAnsweredChallengeIds = allAnswers.map(({ challengeId }) => challengeId);

  const excludedChallengeIds = [...alreadyAnsweredChallengeIds, ...validatedLiveAlertChallengeIds];

  const lastNonAnsweredCertificationChallenge =
    await sessionManagementCertificationChallengeRepository.getNextChallengeByCourseIdForV3(
      assessment.certificationCourseId,
      excludedChallengeIds,
    );

  if (lastNonAnsweredCertificationChallenge) {
    return sharedChallengeRepository.get(lastNonAnsweredCertificationChallenge.challengeId);
  }

  const activeFlashCompatibleChallenges = await sharedChallengeRepository.findActiveFlashCompatible({ locale });

  const alreadyAnsweredChallenges = await sharedChallengeRepository.getMany(alreadyAnsweredChallengeIds);

  const challenges = [...new Set([...alreadyAnsweredChallenges, ...activeFlashCompatibleChallenges])];

  const challengesWithoutSkillsWithAValidatedLiveAlert = _excludeChallengesWithASkillWithAValidatedLiveAlert({
    validatedLiveAlertChallengeIds,
    challenges,
  });

  const candidate = await certificationCandidateRepository.findByAssessmentId({ assessmentId: assessment.id });
  const challengesForCandidate = candidate.accessibilityAdjustmentNeeded
    ? challengesWithoutSkillsWithAValidatedLiveAlert.filter((challenge) => challenge.isAccessible)
    : challengesWithoutSkillsWithAValidatedLiveAlert;
  debugGetNextChallengeForV3Certification(
    candidate.accessibilityAdjustmentNeeded
      ? `Candidate needs accessibility adjustment, possible challenges have been filtered (${challengesForCandidate.length} out of ${challengesWithoutSkillsWithAValidatedLiveAlert.length} selected`
      : `Candidate does need any adjustment, all ${challengesWithoutSkillsWithAValidatedLiveAlert.length} have been selected`,
  );

  const algorithmConfiguration = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(
    certificationCourse.getStartDate(),
  );

  const assessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: algorithmConfiguration,
  });
  const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
    assessmentAnswers: allAnswers,
    challenges: challengesForCandidate,
  });

  if (_hasAnsweredToAllChallenges({ possibleChallenges })) {
    throw new AssessmentEndedError();
  }

  const challenge = pickChallengeService.getChallengePicker()({ possibleChallenges });

  const certificationChallenge = new CertificationChallenge({
    associatedSkillName: challenge.skill.name,
    associatedSkillId: challenge.skill.id,
    challengeId: challenge.id,
    competenceId: challenge.skill.competenceId,
    courseId: certificationCourse.getId(),
    isNeutralized: false,
    certifiableBadgeKey: null,
    discriminant: challenge.discriminant,
    difficulty: challenge.difficulty,
  });

  await sessionManagementCertificationChallengeRepository.save({ certificationChallenge });

  return challenge;
};

const _hasAnsweredToAllChallenges = ({ possibleChallenges }) => {
  return possibleChallenges.length === 0;
};

const _excludeChallengesWithASkillWithAValidatedLiveAlert = ({ validatedLiveAlertChallengeIds, challenges }) => {
  const validatedLiveAlertChallenges = challenges.filter((challenge) => {
    return validatedLiveAlertChallengeIds.includes(challenge.id);
  });

  const excludedSkillIds = validatedLiveAlertChallenges.map((challenge) => challenge.skill.id);

  const challengesWithoutSkillsWithAValidatedLiveAlert = challenges.filter(
    (challenge) => !excludedSkillIds.includes(challenge.skill.id),
  );

  return challengesWithoutSkillsWithAValidatedLiveAlert;
};

const _getValidatedLiveAlertChallengeIds = async ({ assessmentId, certificationChallengeLiveAlertRepository }) => {
  return certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId({ assessmentId });
};

export { getNextChallenge };
