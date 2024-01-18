import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../models/index.js';

const getNextChallengeForCertification = async function ({
  algorithmDataFetcherService,
  answerRepository,
  assessment,
  certificationChallengeRepository,
  certificationChallengeLiveAlertRepository,
  certificationCourseRepository,
  challengeRepository,
  flashAssessmentResultRepository,
  locale,
  pickChallengeService,
  flashAlgorithmService,
  flashAlgorithmConfigurationRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(assessment.certificationCourseId);

  if (certificationCourse.getVersion() === CertificationVersion.V3) {
    const alreadyAnsweredChallengeIds = await _getAlreadyAnsweredChallengeIds({
      assessmentId: assessment.id,
      answerRepository,
    });

    const validatedLiveAlertChallengeIds = await _getValidatedLiveAlertChallengeIds({
      assessmentId: assessment.id,
      certificationChallengeLiveAlertRepository,
    });

    const excludedChallengeIds = [...alreadyAnsweredChallengeIds, ...validatedLiveAlertChallengeIds];

    const lastNonAnsweredCertificationChallenge =
      await certificationChallengeRepository.getNextChallengeByCourseIdForV3(
        assessment.certificationCourseId,
        excludedChallengeIds,
      );

    if (lastNonAnsweredCertificationChallenge) {
      return challengeRepository.get(lastNonAnsweredCertificationChallenge.challengeId);
    }

    const { allAnswers, challenges } = await algorithmDataFetcherService.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const algorithmConfiguration = await flashAlgorithmConfigurationRepository.get();

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
  } else {
    return certificationChallengeRepository
      .getNextNonAnsweredChallengeByCourseId(assessment.id, assessment.certificationCourseId)
      .then((certificationChallenge) => {
        return challengeRepository.get(certificationChallenge.challengeId);
      });
  }
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
  return certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(assessmentId);
};

export { getNextChallengeForCertification };
