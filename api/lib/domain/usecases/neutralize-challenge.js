const ChallengeNeutralized = require('../events/ChallengeNeutralized.js');

module.exports = async function neutralizeChallenge({
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
