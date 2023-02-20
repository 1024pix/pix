import ChallengeNeutralized from '../events/ChallengeNeutralized';

export default async function neutralizeChallenge({
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
}
