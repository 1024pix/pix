const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../errors');

module.exports = async function retrieveLastOrCreateCertificationCourse({
  domainTransaction,
  accessCode,
  sessionId,
  userId,
  assessmentRepository,
  competenceRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationChallengesService,
  placementProfileService,
}) {
  const session = await sessionRepository.get(sessionId);
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }

  const existingCertificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
    domainTransaction
  });
  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  return _startNewCertification({
    domainTransaction,
    sessionId,
    userId,
    assessmentRepository,
    competenceRepository,
    certificationCandidateRepository,
    certificationCourseRepository,
    certificationChallengesService,
    placementProfileService,
  });
};

async function _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId, domainTransaction) {
  return await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
    domainTransaction
  });
}

async function _startNewCertification({
  domainTransaction,
  sessionId,
  userId,
  assessmentRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  certificationChallengesService,
  placementProfileService,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: new Date() });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  const newCertificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

  // Above operations are potentially slow so that two simultaneous calls of this function might overlap 😿
  // In case the simultaneous call finished earlier than the current one, we want to return its result
  const certificationCourseCreatedMeanwhile = await _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId, domainTransaction);
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ userId, sessionId });

  const newCertificationCourse = CertificationCourse.from({ certificationCandidate, challenges: newCertificationChallenges });

  const savedCertificationCourse = await certificationCourseRepository.save({
    certificationCourse: newCertificationCourse,
    domainTransaction
  });

  const newAssessment = _generateAssessmentForCertificationCourse({ userId, courseId: savedCertificationCourse.id });
  const savedAssessment = await assessmentRepository.save({ assessment: newAssessment, domainTransaction });
  savedCertificationCourse.assessment = savedAssessment;

  return {
    created: true,
    certificationCourse: savedCertificationCourse,
  };
}

function _generateAssessmentForCertificationCourse({ userId, courseId }) {
  return new Assessment({
    userId,
    courseId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CERTIFICATION,
  });
}
