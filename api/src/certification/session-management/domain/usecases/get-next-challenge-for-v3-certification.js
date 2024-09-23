/**
 * @typedef {import('./index.js').AnswerRepository} AnswerRepository
 * @typedef {import('./index.js').CertificationChallengeRepository} CertificationChallengeRepository
 * @typedef {import('./index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('./index.js').FlashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {import('./index.js').PickChallengeService} PickChallengeService
 * @typedef {import('./index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../../../session-management/domain/usecases/index.js').AnswerRepository} AnswerRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationChallengeRepository} CertificationChallengeRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').FlashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').PickChallengeService} PickChallengeService
 * @typedef {import('../../../session-management/domain/usecases/index.js').FlashAlgorithmService} FlashAlgorithmService
 * @typedef {import('../../../session-management/domain/usecases/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 */

import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../../../../shared/domain/models/index.js';

/**
 * @param {Object} params
 * @param {AnswerRepository} params.answerRepository
 * @param {CertificationChallengeRepository} params.certificationChallengeRepository
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {ChallengeRepository} params.challengeRepository
 * @param {FlashAlgorithmConfigurationRepository} params.flashAlgorithmConfigurationRepository
 * @param {FlashAlgorithmService} params.flashAlgorithmService
 * @param {PickChallengeService} params.pickChallengeService
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 */
const getNextChallengeForV3Certification = async function ({
  assessment,
  answerRepository,
  certificationChallengeRepository,
  certificationChallengeLiveAlertRepository,
  certificationCourseRepository,
  challengeRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  locale,
  pickChallengeService,
  certificationCandidateForSupervisingRepository,
  certificationCandidateId,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: assessment.certificationCourseId });

  const alreadyAnsweredChallengeIds = await _getAlreadyAnsweredChallengeIds({
    assessmentId: assessment.id,
    answerRepository,
  });

  const validatedLiveAlertChallengeIds = await _getValidatedLiveAlertChallengeIds({
    assessmentId: assessment.id,
    certificationChallengeLiveAlertRepository,
  });

  const excludedChallengeIds = [...alreadyAnsweredChallengeIds, ...validatedLiveAlertChallengeIds];

  const lastNonAnsweredCertificationChallenge = await certificationChallengeRepository.getNextChallengeByCourseIdForV3(
    assessment.certificationCourseId,
    excludedChallengeIds,
  );

  if (lastNonAnsweredCertificationChallenge) {
    return challengeRepository.get(lastNonAnsweredCertificationChallenge.challengeId);
  }

  const [allAnswers, challenges] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    challengeRepository.findActiveFlashCompatible({ locale }),
  ]);

  const algorithmConfiguration = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(
    certificationCourse.getStartDate(),
  );

  const assessmentAlgorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: algorithmConfiguration,
  });

  const challengesWithoutSkillsWithAValidatedLiveAlert = _excludeChallengesWithASkillWithAValidatedLiveAlert({
    validatedLiveAlertChallengeIds,
    challenges,
  });

  const candidate = await certificationCandidateForSupervisingRepository.get({ certificationCandidateId });
  const challengesForCandidate = candidate.accessibilityAdjustmentNeeded
    ? challengesWithoutSkillsWithAValidatedLiveAlert.filter((challenge) => {
        return (
          (challenge.accessibility1 === 'OK' || challenge.accessibility1 === 'RAS') &&
          (challenge.accessibility2 === 'OK' || challenge.accessibility2 === 'RAS')
        );
      })
    : challengesWithoutSkillsWithAValidatedLiveAlert;

  const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
    assessmentAnswers: allAnswers,
    challenges: challengesForCandidate,
  });

  if (_hasAnsweredToAllChallenges({ possibleChallenges })) {
    throw new AssessmentEndedError();
  }

  const challenge = pickChallengeService.chooseNextChallenge()({ possibleChallenges });

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

  await certificationChallengeRepository.save({ certificationChallenge });

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

const _getAlreadyAnsweredChallengeIds = async ({ assessmentId, answerRepository }) => {
  const answers = await answerRepository.findByAssessment(assessmentId);
  const alreadyAnsweredChallengeIds = answers.map(({ challengeId }) => challengeId);

  return alreadyAnsweredChallengeIds;
};

const _getValidatedLiveAlertChallengeIds = async ({ assessmentId, certificationChallengeLiveAlertRepository }) => {
  return certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId({ assessmentId });
};

export { getNextChallengeForV3Certification };
