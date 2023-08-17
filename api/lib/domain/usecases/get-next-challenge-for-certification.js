import { config } from '../../config.js';
import { CertificationVersion } from '../models/CertificationVersion.js';
import { CertificationChallenge, FlashAssessmentAlgorithm } from '../models/index.js';

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
    const lastNonAnsweredCertificationChallenge =
      await certificationChallengeRepository.getNextNonAnsweredChallengeByCourseIdForV3(
        assessment.id,
        assessment.certificationCourseId,
      );

    if (lastNonAnsweredCertificationChallenge) {
      return challengeRepository.get(lastNonAnsweredCertificationChallenge.challengeId);
    }

    const { allAnswers, challenges, estimatedLevel } = await algorithmDataFetcherService.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      maximumAssessmentLength: config.v3Certification.numberOfChallengesPerCourse,
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

export { getNextChallengeForCertification };
