const _ = require('lodash');

const CertificationCourse = require('../models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../errors');

function _canStartACertification(userCompetences) {
  const competencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter((competence) => competence.estimatedLevel > 0);

  return _.size(competencesWithEstimatedLevelHigherThan0) >= 5;
}

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCourseRepository
}) {

  const now = new Date();
  const userCompetencesProfile = await userService.getProfileToCertifyV2({ userId, limitDate: now });

  if (!_canStartACertification(userCompetencesProfile)) {
    throw new UserNotAuthorizedToCertifyError();
  }

  const newCertificationCourse = new CertificationCourse({ userId, sessionId, isV2Certification: true });
  const savedCertificationCourse = await certificationCourseRepository.save(newCertificationCourse);
  return certificationChallengesService.saveChallenges(userCompetencesProfile, savedCertificationCourse);
}

module.exports = async function retrieveLastOrCreateCertificationCourse({
  accessCode,
  userId,
  sessionService,
  userService,
  certificationChallengesService,
  certificationCourseRepository
}) {
  const sessionId = await sessionService.sessionExists(accessCode);
  const certificationCourses = await certificationCourseRepository.findLastCertificationCourseByUserIdAndSessionId(userId, sessionId);

  if (_.size(certificationCourses) > 0) {
    return { created: false, certificationCourse: certificationCourses[0] };
  } else {
    const certificationCourse = await _startNewCertification({
      userId,
      sessionId,
      userService,
      certificationChallengesService,
      certificationCourseRepository
    });
    return { created: true, certificationCourse };
  }
};
