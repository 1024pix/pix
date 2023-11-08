import { ChallengeNeutralized } from '../events/ChallengeNeutralized.js';

const neutralizeChallenge = async function ({
  certificationAssessmentRepository,
  certificationCourseId,
  challengeRecId,
  juryId,
  locale,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.neutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeNeutralized({ certificationCourseId, juryId, locale });
};

export { neutralizeChallenge };
