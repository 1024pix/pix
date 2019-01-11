const _ = require('lodash');
const moment = require('moment');

const CertificationCourse = require('../models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../errors');

function _checkIfUserCanStartACertification(userCompetences) {
  const competencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter((competence) => competence.estimatedLevel > 0);

  if (_.size(competencesWithEstimatedLevelHigherThan0) < 5) throw new UserNotAuthorizedToCertifyError();
}

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCourseRepository
}) {
  const newCertificationCourse = new CertificationCourse({ userId, sessionId });

  const userCompetences = await userService.getProfileToCertify(userId, moment().toISOString());
  _checkIfUserCanStartACertification(userCompetences);
  const savedCertificationCourse = await certificationCourseRepository.save(newCertificationCourse);
  //TODO : Creer ici un tableau de CertificationChalleges (Domain Object) avec certificationCourseId rempli
  return certificationChallengesService.saveChallenges(userCompetences, savedCertificationCourse);
}

module.exports = async function createCertificationCourseOrRetrieveLast({
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
