/**
 * @typedef {import('../../../evaluation/domain/usecases/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('../../../evaluation/domain/usecases/index.js').CalibratedChallengeRepository} CalibratedChallengeRepository
 * @typedef {import('../../../evaluation/domain/usecases/index.js').AssessmentSheetRepository} AssessmentSheetRepository
 * @typedef {import('../../../evaluation/domain/usecases/index.js').SessionManagementCertificationChallengeRepository} SessionManagementCertificationChallengeRepository
 * @typedef {import('../../../evaluation/domain/usecases/index.js').VersionApi} VersionApi
 * @typedef {import('../../../evaluation/domain/usecases/index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {typeof import('../services/pick-challenge-service.js').default} PickChallengeService
 * @typedef {import('../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../shared/domain/models/Assessment.js').Assessment} Assessment
 */

import { AssessmentEndedError, NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationChallenge } from '../../../shared/domain/models/CertificationChallenge.js';
import { FlashAssessmentAlgorithm } from '../models/FlashAssessmentAlgorithm.js';

/**
 * @param {object} params
 * @param {number} params.assessmentId
 * @param {AssessmentSheetRepository} params.assessmentSheetRepository
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {CalibratedChallengeRepository} params.calibratedChallengeRepository
 * @param {VersionApi} params.versionApi
 * @param {SessionManagementCertificationChallengeRepository} params.sessionManagementCertificationChallengeRepository
 * @param {FlashAlgorithmService} params.flashAlgorithmService
 * @param {PickChallengeService} params.pickChallengeService
 *
 * @returns {Promise<string>} next challenge id
 * @throws {NotFoundError}
 * @throws {AssessmentEndedError}
 */
export async function getNextChallenge({
  assessmentId,
  assessmentSheetRepository,
  certificationChallengeLiveAlertRepository,
  sessionManagementCertificationChallengeRepository,
  calibratedChallengeRepository,
  versionApi,
  flashAlgorithmService,
  pickChallengeService,
}) {
  const assessmentSheet = await assessmentSheetRepository.getByAssessmentId(assessmentId);

  if (!assessmentSheet) {
    throw new NotFoundError(`No AssessmentSheet found for assessmentId ${assessmentId}`);
  }

  const validatedLiveAlertChallengeIds = await _getValidatedLiveAlertChallengeIds({
    assessmentId: assessmentSheet.assessmentId,
    certificationChallengeLiveAlertRepository,
  });

  const assessmentAnswers = assessmentSheet.answers;
  const allAnswers = assessmentAnswers.filter(
    ({ challengeId }) => !validatedLiveAlertChallengeIds.includes(challengeId),
  );

  const answeredChallengeIds = allAnswers.map(({ challengeId }) => challengeId);

  const excludedChallengeIds = [...answeredChallengeIds, ...validatedLiveAlertChallengeIds];

  const lastNonAnsweredCertificationChallenge =
    await sessionManagementCertificationChallengeRepository.getNextChallengeByCourseId(
      assessmentSheet.certificationCourseId,
      excludedChallengeIds,
    );

  if (lastNonAnsweredCertificationChallenge) {
    return lastNonAnsweredCertificationChallenge.challengeId;
  }

  const version = await versionApi.getById({ id: assessmentSheet.versionId });

  const currentCalibratedChallenges = await calibratedChallengeRepository.findActiveFlashCompatible({
    locale: assessmentSheet.lang,
    version,
  });

  const answeredCalibratedChallenges = await calibratedChallengeRepository.getMany({
    ids: answeredChallengeIds,
    version,
  });

  const challenges = candidateCertificationReferential(answeredCalibratedChallenges, currentCalibratedChallenges);

  const challengesWithoutSkillsWithAValidatedLiveAlert = _excludeChallengesWithASkillWithAValidatedLiveAlert({
    validatedLiveAlertChallengeIds,
    challenges,
  });

  const challengesForCandidate = assessmentSheet.accessibilityAdjustmentNeeded
    ? challengesWithoutSkillsWithAValidatedLiveAlert.filter((challenge) => challenge.isAccessible)
    : challengesWithoutSkillsWithAValidatedLiveAlert;

  const assessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: version.challengesConfiguration,
  });

  const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
    assessmentAnswers: allAnswers,
    challenges: challengesForCandidate,
  });

  if (_hasAnsweredToAllChallenges({ possibleChallenges })) {
    throw new AssessmentEndedError();
  }

  const challenge = pickChallengeService.getChallengePicker(
    version.challengesConfiguration.defaultProbabilityToPickChallenge,
  )({ possibleChallenges });

  const certificationChallenge = new CertificationChallenge({
    associatedSkillName: challenge.skill.name,
    associatedSkillId: challenge.skill.id,
    challengeId: challenge.id,
    competenceId: challenge.skill.competenceId,
    courseId: assessmentSheet.certificationCourseId,
    isNeutralized: false,
    certifiableBadgeKey: null,
    discriminant: challenge.discriminant,
    difficulty: challenge.difficulty,
  });

  await sessionManagementCertificationChallengeRepository.save({ certificationChallenge });

  return challenge.id;
}

function _hasAnsweredToAllChallenges({ possibleChallenges }) {
  return possibleChallenges.length === 0;
}

/**
 * Excludes challenges if their associated skill has a validated live alert.
 *
 * @param {object} params
 * @param {Array<string>} params.validatedLiveAlertChallengeIds - An array of challenge IDs with validated live alerts.
 * @param {Array<CalibratedChallenge>} params.challenges - An array of calibrated challenges.
 * @returns {Array<CalibratedChallenge>} An array of challenges with skills that do not have validated live alerts.
 */
function _excludeChallengesWithASkillWithAValidatedLiveAlert({ validatedLiveAlertChallengeIds, challenges }) {
  const validatedLiveAlertChallenges = challenges.filter((challenge) => {
    return validatedLiveAlertChallengeIds.includes(challenge.id);
  });

  const excludedSkillIds = validatedLiveAlertChallenges.map((challenge) => challenge.skill.id);

  return challenges.filter((challenge) => !excludedSkillIds.includes(challenge.skill.id));
}

async function _getValidatedLiveAlertChallengeIds({ assessmentId, certificationChallengeLiveAlertRepository }) {
  return certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId({ assessmentId });
}

/**
 * Construct a certification referential in the state presented to the current user
 * Allows the LCMS to be released during a certification without impacting the user
 *
 * Example: after LCMS release if a challenge becomes archived ('perime'), this challenge will be in
 *          `answeredCalibratedChallenges` param, but not in `currentCalibratedChallenges` param
 * @param {Array<CalibratedChallenge>} answeredCalibratedChallenges
 * @param {Array<CalibratedChallenge>} currentCalibratedChallenges.
 * @returns {Array<CalibratedChallenge>}
 */
export function candidateCertificationReferential(answeredCalibratedChallenges, currentCalibratedChallenges) {
  // It is critical that answeredCalibratedChallenges is in first parameter in order to take precedence
  const challenges = [...answeredCalibratedChallenges, ...currentCalibratedChallenges];

  return Object.values(
    challenges.reduce((acc, challenge) => {
      const existing = acc[challenge.id];

      if (!existing) {
        acc[challenge.id] = challenge;
      }

      return acc;
    }, {}),
  );
}
