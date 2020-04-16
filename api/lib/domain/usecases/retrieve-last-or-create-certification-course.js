const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../errors');

module.exports = async function retrieveLastOrCreateCertificationCourse({
  accessCode,
  sessionId,
  userId,
  assessmentRepository,
  certificationCandidateRepository,
  certificationChallengeRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationChallengesService,
  userService,
}) {
  const session = await sessionRepository.get(sessionId);
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }

  const existingCertificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({ userId, sessionId });
  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  return _startNewCertification({
    sessionId,
    userId,
    assessmentRepository,
    certificationCandidateRepository,
    certificationChallengeRepository,
    certificationCourseRepository,
    certificationChallengesService,
    userService,
  });
};

async function _startNewCertification({
  sessionId,
  userId,
  assessmentRepository,
  certificationCandidateRepository,
  certificationChallengeRepository,
  certificationCourseRepository,
  certificationChallengesService,
  userService,
}) {
  const certificationProfile = await userService.getCertificationProfile({ userId, limitDate: new Date() });

  if (!certificationProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  await userService.fillCertificationProfileWithChallenges(certificationProfile);

  const existingCertificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({ userId, sessionId });
  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  const newCertificationCourse = await _generateCertificationCourseFromCandidateParticipation({ userId, sessionId, certificationCandidateRepository });
  const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse: newCertificationCourse });
  const newAssessment = _generateAssessmentForCertificationCourse({ userId, certificationCourseId: savedCertificationCourse.id });
  const savedAssessment = await assessmentRepository.save({ assessment: newAssessment });
  const newCertificationChallenges = certificationChallengesService.generateCertificationChallenges(certificationProfile.userCompetences, savedCertificationCourse.id);
  const savedChallenges = await Promise.all(newCertificationChallenges.map((certificationChallenge) => certificationChallengeRepository.save(certificationChallenge)));

  savedCertificationCourse.assessment = savedAssessment;
  savedCertificationCourse.challenges = savedChallenges;

  return {
    created: true,
    certificationCourse: savedCertificationCourse,
  };
}

async function _generateCertificationCourseFromCandidateParticipation({ userId, sessionId, certificationCandidateRepository }) {
  const personalInfo = { firstName: null, lastName: null, birthdate: null, birthplace: null, externalId: null };
  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

  personalInfo.firstName = certificationCandidate.firstName;
  personalInfo.lastName = certificationCandidate.lastName;
  personalInfo.birthdate = certificationCandidate.birthdate;
  personalInfo.birthplace = certificationCandidate.birthCity;
  personalInfo.externalId = certificationCandidate.externalId;

  return new CertificationCourse({
    userId,
    sessionId,
    ...personalInfo,
    isV2Certification: true,
  });
}

function _generateAssessmentForCertificationCourse({ userId, certificationCourseId }) {
  return new Assessment({
    userId,
    certificationCourseId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CERTIFICATION,
  });
}
