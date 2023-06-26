import { CertificationVersion } from '../models/CertificationVersion.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../models/index.js';
import { MAX_NEXT_GEN_CERTIFICATION_CHALLENGES } from '../constants.js';

const getNextChallengeForCertification = async function ({
  algorithmDataFetcherService,
  answerRepository,
  assessment,
  certificationChallengeRepository,
  certificationCourseRepository,
  challengeRepository,
  flashAssessmentResultRepository,
  locale,
  pickChallengeService,
}) {
  const certificationCourse = await certificationCourseRepository.get(assessment.certificationCourseId);

  if (certificationCourse.getVersion() === CertificationVersion.V3) {
    const { allAnswers, challenges, estimatedLevel } = await algorithmDataFetcherService.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      maximumAssessmentLength: MAX_NEXT_GEN_CERTIFICATION_CHALLENGES,
    });

    const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
    });

    const challenge = pickChallengeService.chooseNextChallenge(assessment.id)({ possibleChallenges });

    const certificationChallenge = new CertificationChallenge({
      associatedSkillName: challenge.skill.name,
      associatedSkillId: challenge.skill.id,
      challengeId: challenge.id,
      courseId: certificationCourse.getId(),
      competenceId: challenge.competenceId,
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

export { getNextChallengeForCertification };
