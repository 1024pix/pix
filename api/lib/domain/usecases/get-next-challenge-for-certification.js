import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../models/index.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmConfiguration.js';

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

    const algorithmConfiguration = _createDefaultAlgorithmConfiguration();

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: flashAlgorithmService,
      configuration: algorithmConfiguration,
    });

    const activeChallenges = challenges.filter((challenge) => !validatedLiveAlertChallengeIds.includes(challenge.id));

    const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
      assessmentAnswers: allAnswers,
      challenges: activeChallenges,
    });

    const challenge = pickChallengeService.chooseNextChallenge(assessment.id)({ possibleChallenges });

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

const _getAlreadyAnsweredChallengeIds = async ({ assessmentId, answerRepository }) => {
  const answers = await answerRepository.findByAssessment(assessmentId);
  const alreadyAnsweredChallengeIds = answers.map(({ challengeId }) => challengeId);

  return alreadyAnsweredChallengeIds;
};

const _getValidatedLiveAlertChallengeIds = async ({ assessmentId, certificationChallengeLiveAlertRepository }) => {
  return certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(assessmentId);
};

const _createDefaultAlgorithmConfiguration = () => {
  return new FlashAssessmentAlgorithmConfiguration({
    warmUpLength: 0,
    forcedCompetences: [],
    limitToOneQuestionPerTube: false,
    minimumEstimatedSuccessRateRanges: [],
    enablePassageByAllCompetences: false,
  });
};

export { getNextChallengeForCertification };
