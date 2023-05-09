import { ChallengeDeneutralized } from '../events/ChallengeDeneutralized.js';

const deneutralizeChallenge = async function ({
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
};

export { deneutralizeChallenge };
