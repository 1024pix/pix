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
  certificationChallengeRepository,
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
    certificationChallengeRepository,
    certificationCourseRepository,
    certificationChallengesService,
    placementProfileService,
  });
};

async function _startNewCertification({
  domainTransaction,
  sessionId,
  userId,
  assessmentRepository,
  certificationCandidateRepository,
  certificationChallengeRepository,
  certificationCourseRepository,
  certificationChallengesService,
  placementProfileService,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: new Date() });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  const newCertificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

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

  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ userId, sessionId });

  const newCertificationCourse = CertificationCourse.from({ certificationCandidate, challenges: newCertificationChallenges });

  // certificationCourseRepository.save(certificationCourse);
  const savedCertificationCourse = await _saveCertificationCourse(certificationCourseRepository, newCertificationCourse, domainTransaction, certificationChallengeRepository);

  const newAssessment = _generateAssessmentForCertificationCourse({ userId, courseId: savedCertificationCourse.id });
  const savedAssessment = await assessmentRepository.save({ assessment: newAssessment, domainTransaction });
  savedCertificationCourse.assessment = savedAssessment;

  return {
    created: true,
    certificationCourse: savedCertificationCourse,
  };
}

async function _saveCertificationCourse(certificationCourseRepository, newCertificationCourse, domainTransaction, certificationChallengeRepository) {
  const savedCertificationCourse = await certificationCourseRepository.save({
    certificationCourse: newCertificationCourse,
    domainTransaction
  });
  const savedChallenges = await Promise.all(savedCertificationCourse.challenges.map((certificationChallenge) => {
    const certificationChallengeWithCourseId = { ...certificationChallenge, courseId: savedCertificationCourse.id };
    return certificationChallengeRepository.save({ certificationChallenge: certificationChallengeWithCourseId, domainTransaction });
  }));
  savedCertificationCourse.challenges = savedChallenges;
  return savedCertificationCourse;
}

function _generateAssessmentForCertificationCourse({ userId, courseId }) {
  return new Assessment({
    userId,
    courseId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CERTIFICATION,
  });
}
