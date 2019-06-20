const _ = require('lodash');

const CertificationCourse = require('../models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../errors');

function _canStartACertification(userCompetences) {
  const competencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter((competence) => competence.estimatedLevel > 0);

  return _.size(competencesWithEstimatedLevelHigherThan0) >= 5;
}

function _selectProfileToCertify(userCompetencesProfileV1, userCompetencesProfileV2) {
  const canStartACertificationOnProfileV2 = _canStartACertification(userCompetencesProfileV2);
  const canStartACertificationOnProfileV1 = _canStartACertification(userCompetencesProfileV1);

  if (!canStartACertificationOnProfileV1 && !canStartACertificationOnProfileV2) {
    return null;
  }

  else if (canStartACertificationOnProfileV1 && !canStartACertificationOnProfileV2) {
    return userCompetencesProfileV1;
  }

  else if (!canStartACertificationOnProfileV1 && canStartACertificationOnProfileV2) {
    return userCompetencesProfileV2;
  }

  else {
    const pixScoreProfileV1 = _.sumBy(userCompetencesProfileV1, 'pixScore');
    const pixScoreProfileV2 = _.sumBy(userCompetencesProfileV2, 'pixScore');

    if (pixScoreProfileV1 >= pixScoreProfileV2) return userCompetencesProfileV1;

    return userCompetencesProfileV2;
  }
}

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCourseRepository
}) {

  const now = new Date();
  const [userCompetencesProfileV1, userCompetencesProfileV2] = await Promise.all([
    userService.getProfileToCertifyV1({ userId, now }),
    userService.getProfileToCertifyV2({ userId, now }),
  ]);

  const userCompetencesToCertify = _selectProfileToCertify(userCompetencesProfileV1, userCompetencesProfileV2);
  if (!userCompetencesToCertify) {
    throw new UserNotAuthorizedToCertifyError();
  }

  const isV2Certification = userCompetencesToCertify === userCompetencesProfileV2;

  const newCertificationCourse = new CertificationCourse({ userId, sessionId, isV2Certification });
  const savedCertificationCourse = await certificationCourseRepository.save(newCertificationCourse);
  return certificationChallengesService.saveChallenges(userCompetencesToCertify, savedCertificationCourse);
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
