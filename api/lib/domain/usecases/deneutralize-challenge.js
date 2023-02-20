import ChallengeDeneutralized from '../events/ChallengeDeneutralized';

export default async function deneutralizeChallenge({
  certificationAssessmentRepository,
  certificationCourseId,
  challengeRecId,
  juryId,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.deneutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeDeneutralized({ certificationCourseId, juryId });
}
