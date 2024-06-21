import { CertificationChallenge, FlashAssessmentAlgorithm } from '../../../../../lib/domain/models/index.js';

const getNextChallengeForV3Certification = async function ({
  answerRepository,
  assessment,
  certificationChallengeRepository,
  certificationChallengeLiveAlertRepository,
  certificationCourseRepository,
  challengeRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  locale,
  pickChallengeService,
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

  const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
    assessmentAnswers: allAnswers,
    challenges: challengesWithoutSkillsWithAValidatedLiveAlert,
  });

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
