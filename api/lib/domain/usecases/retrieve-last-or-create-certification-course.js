const CertificationCourse = require('../models/CertificationCourse');
const UserCompetence = require('../models/UserCompetence');
const Assessment = require('../models/Assessment');
const { UserNotAuthorizedToCertifyError } = require('../errors');
const _ = require('lodash');

module.exports = async function retrieveLastOrCreateCertificationCourse({
  accessCode,
  userId,
  sessionService,
  userService,
  certificationChallengesService,
  certificationCourseRepository,
  assessmentRepository,
}) {
  const sessionId = await sessionService.sessionExists(accessCode);
  const certificationCourses = await certificationCourseRepository.findLastCertificationCourseByUserIdAndSessionId(userId, sessionId);

  if (_.size(certificationCourses) > 0) {
    return {
      created: false,
      certificationCourse: certificationCourses[0],
    };
  }

  return _startNewCertification({
    userId,
    sessionId,
    userService,
    certificationChallengesService,
    certificationCourseRepository,
    assessmentRepository,
  });
};

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCourseRepository,
  assessmentRepository,
}) {
  const now = new Date();
  const userCompetencesProfile = await userService.getProfileToCertifyV2({ userId, limitDate: now });

  if (!UserCompetence.isCertifiable(userCompetencesProfile)) {
    throw new UserNotAuthorizedToCertifyError();
  }

  const certificationCourses = await certificationCourseRepository.findLastCertificationCourseByUserIdAndSessionId(userId, sessionId);
  if (_.size(certificationCourses) > 0) {
    return {
      created: false,
      certificationCourse: certificationCourses[0],
    };
  }
  const newCertificationCourse = new CertificationCourse({ userId, sessionId, isV2Certification: true });
  const savedCertificationCourse = await certificationCourseRepository.save(newCertificationCourse);
  await _createAssessmentForCertificationCourse({ userId, certificationCourseId: savedCertificationCourse.id, assessmentRepository });
  return {
    created: true,
    certificationCourse: await certificationChallengesService.saveChallenges(userCompetencesProfile, savedCertificationCourse),
  };
}

function _createAssessmentForCertificationCourse({ userId, certificationCourseId, assessmentRepository }) {
  const assessment = new Assessment({
    userId,
    courseId: certificationCourseId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CERTIFICATION,
  });

  return assessmentRepository.save(assessment);
}

