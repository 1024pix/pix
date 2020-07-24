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

  // certficationProfile = CertificationProfile.from(placementProfile);

  // FIXME : Ce n'est pas la responsabilité du placementProfile que d'avoir les challenges
  const placementProfileWithChallenges = await placementProfileService.fillPlacementProfileWithChallenges(placementProfile);
  // certificationCourseChallenges = identifierLesChallenges(certificationProfile); // $$$

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
  const newCertificationChallenges = certificationChallengesService.generateCertificationChallenges(placementProfileWithChallenges.userCompetences);

  const newCertificationCourse = CertificationCourse.from({ certificationCandidate, challenges:newCertificationChallenges });
  // const certificationCourse = CertificationCourse.from(certificationProfile, certificationCourseChallenges, certificationCandidate);
  // certificationCourseRepository.save(certificationCourse);

  const savedCertificationCourse = await certificationCourseRepository.save({
    certificationCourse: newCertificationCourse,
    domainTransaction
  });
  const savedChallenges = await Promise.all(newCertificationChallenges.map((certificationChallenge) => {
    const certificationChallengeWithCourseId = { ...certificationChallenge, courseId: savedCertificationCourse.id };
    return certificationChallengeRepository.save({ certificationChallenge: certificationChallengeWithCourseId, domainTransaction });
  }));
  savedCertificationCourse.challenges = savedChallenges;

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
