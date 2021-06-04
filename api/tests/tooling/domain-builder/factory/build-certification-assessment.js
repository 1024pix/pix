const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const buildCertificationChallengeWithType = require('./build-certification-challenge-with-type');

module.exports = function buildCertificationAssessment(
  {
    id = 123,
    userId = 123,
    certificationCourseId = 123,
    createdAt = new Date('2020-01-01'),
    completedAt = new Date('2020-01-01'),
    state = CertificationAssessment.states.STARTED,
    isV2Certification = true,
    certificationChallenges = [buildCertificationChallengeWithType()],
    certificationAnswersByDate = [],
  } = {}) {
  return new CertificationAssessment({
    id,
    userId,
    certificationCourseId,
    createdAt,
    completedAt,
    state,
    isV2Certification,
    certificationChallenges,
    certificationAnswersByDate,
  });
};
