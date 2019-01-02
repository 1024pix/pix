const moment = require('moment');

const CertificationCourse = require('../models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../errors');

function _checkIfUserCanStartACertification(userCompetences) {
  const nbCompetencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter((competence) => competence.estimatedLevel > 0)
    .length;

  if (nbCompetencesWithEstimatedLevelHigherThan0 < 5)
    throw new UserNotAuthorizedToCertifyError();
}

function _startNewCertification(userId, sessionId, userService, certificationChallengesService, certificationCourseRepository) {
  let userCompetencesToCertify;
  const newCertificationCourse = new CertificationCourse({ userId, sessionId });

  return userService.getProfileToCertify(userId, moment().toISOString())
    .then((userCompetences) => {
      userCompetencesToCertify = userCompetences;
      return _checkIfUserCanStartACertification(userCompetences);
    })
    .then(() => certificationCourseRepository.save(newCertificationCourse))
    //TODO : Creer ici un tableau de CertificationChalleges (Domain Object) avec certificationCourseId rempli
    .then((savedCertificationCourse) => certificationChallengesService.saveChallenges(userCompetencesToCertify, savedCertificationCourse));
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

  if (certificationCourses && certificationCourses.length > 0) {
    return { created: false, certificationCourse: certificationCourses[0] };
  } else {
    const certificationCourse = await _startNewCertification(userId, sessionId, userService, certificationChallengesService, certificationCourseRepository);
    return { created: true, certificationCourse };
  }
};
