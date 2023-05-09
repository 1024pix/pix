import { ChallengeNeutralized } from '../events/ChallengeNeutralized.js';

const neutralizeChallenge = async function ({
  certificationAssessmentRepository,
  certificationCourseId,
  challengeRecId,
  juryId,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.neutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeNeutralized({ certificationCourseId, juryId });
};

export { neutralizeChallenge };
