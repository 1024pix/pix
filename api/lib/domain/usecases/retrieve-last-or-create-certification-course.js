const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../errors');

module.exports = async function retrieveLastOrCreateCertificationCourse({
  sessionId,
  accessCode,
  userId,
  sessionRepository,
  userService,
  certificationCandidateRepository,
  certificationChallengesService,
  certificationCourseRepository,
  assessmentRepository,
}) {
  const session = await sessionRepository.get(sessionId);

  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }

  try {
    const certificationCourse = await certificationCourseRepository.getLastCertificationCourseByUserIdAndSessionId(userId, sessionId);

    return {
      created: false,
      certificationCourse,
    };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return _startNewCertification({
        userId,
        sessionId,
        userService,
        certificationCandidateRepository,
        certificationChallengesService,
        certificationCourseRepository,
        assessmentRepository,
      });
    }

    throw err;
  }
};

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCandidateRepository,
  certificationCourseRepository,
  assessmentRepository,
}) {
  const certificationProfile = await userService.getCertificationProfile({ userId, limitDate: new Date() });

  if (!certificationProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  await userService.fillCertificationProfileWithCertificationChallenges(certificationProfile);

  try {
    const certificationCourse = await certificationCourseRepository.getLastCertificationCourseByUserIdAndSessionId(userId, sessionId);

    return {
      created: false,
      certificationCourse,
    };
  } catch (err) {
    if (err instanceof NotFoundError) {
      const personalInfo = { firstName: null, lastName: null, birthdate: null, birthplace: null, externalId: null };
      const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

      personalInfo.firstName = certificationCandidate.firstName;
      personalInfo.lastName = certificationCandidate.lastName;
      personalInfo.birthdate = certificationCandidate.birthdate;
      personalInfo.birthplace = certificationCandidate.birthCity;
      personalInfo.externalId = certificationCandidate.externalId;

      const newCertificationCourse = new CertificationCourse({
        userId,
        sessionId,
        ...personalInfo,
        isV2Certification: true,
      });

      const savedCertificationCourse = await certificationCourseRepository.save(newCertificationCourse);
      const assessment = await _createAssessmentForCertificationCourse({ userId, certificationCourseId: savedCertificationCourse.id, assessmentRepository });
      savedCertificationCourse.assessment = assessment;

      return {
        created: true,
        certificationCourse: await certificationChallengesService.saveChallenges(certificationProfile.userCompetences, savedCertificationCourse),
      };
    }

    throw err;
  }
}

function _createAssessmentForCertificationCourse({ userId, certificationCourseId, assessmentRepository }) {
  const assessment = new Assessment({
    userId,
    certificationCourseId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CERTIFICATION,
  });

  return assessmentRepository.save(assessment);
}
