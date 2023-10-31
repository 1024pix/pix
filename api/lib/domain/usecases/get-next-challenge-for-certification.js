import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../models/index.js';
import { config } from '../../config.js';

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
  warmUpLength = 0,
  forcedCompetences = [],
  limitToOneQuestionPerTube = false,
  minimumEstimatedSuccessRateRanges = [],
  enablePassageByAllCompetences = false,
}) {
  const certificationCourse = await certificationCourseRepository.get(assessment.certificationCourseId);

  if (certificationCourse.getVersion() === CertificationVersion.V3) {
    const excludedChallengeIds = await _getExcludedChallengeIds({
      assessmentId: assessment.id,
      answerRepository,
      certificationChallengeLiveAlertRepository,
    });

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

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      maximumAssessmentLength: config.v3Certification.numberOfChallengesPerCourse,
      flashAlgorithmImplementation: flashAlgorithmService,
      warmUpLength,
      forcedCompetences,
      limitToOneQuestionPerTube,
      minimumEstimatedSuccessRateRanges,
      enablePassageByAllCompetences,
    });

    const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
      allAnswers,
      challenges,
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

const _getExcludedChallengeIds = async ({
  assessmentId,
  answerRepository,
  certificationChallengeLiveAlertRepository,
}) => {
  const answers = await answerRepository.findByAssessment(assessmentId);
  const alreadyAnsweredChallengeIds = answers.map(({ challengeId }) => challengeId);

  const validatedLiveAlertsForAssessment =
    await certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(assessmentId);
  const mappedAlertedChallengeIds = validatedLiveAlertsForAssessment.map(({ challengeId }) => challengeId);

  return [...alreadyAnsweredChallengeIds, ...mappedAlertedChallengeIds];
};

export { getNextChallengeForCertification };
