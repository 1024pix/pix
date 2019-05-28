const _ = require('lodash');

const CertificationCourse = require('../models/CertificationCourse');
const { UserNotAuthorizedToCertifyError } = require('../errors');

function _canStartACertification(userCompetences) {
  const competencesWithEstimatedLevelHigherThan0 = userCompetences
    .filter((competence) => competence.estimatedLevel > 0);

  return _.size(competencesWithEstimatedLevelHigherThan0) >= 5;
}

function _selectProfileToCertify(userCompetencesProfilV1, userCompetencesProfilV2) {
  const canStartACertificationOnProfileV2 = _canStartACertification(userCompetencesProfilV2);
  const canStartACertificationOnProfileV1 = _canStartACertification(userCompetencesProfilV1);

  if (!canStartACertificationOnProfileV1 && !canStartACertificationOnProfileV2) {
    throw new UserNotAuthorizedToCertifyError();
  }

  else if (canStartACertificationOnProfileV1 && !canStartACertificationOnProfileV2) {
    return userCompetencesProfilV1;
  }

  else if (!canStartACertificationOnProfileV1 && canStartACertificationOnProfileV2) {
    return userCompetencesProfilV2;
  }

  else {
    const pixScoreProfilV1 = _.sumBy(userCompetencesProfilV1, 'pixScore');
    const pixScoreProfilV2 = _.sumBy(userCompetencesProfilV2, 'pixScore');

    if (pixScoreProfilV1 >= pixScoreProfilV2) return userCompetencesProfilV1;

    return userCompetencesProfilV2;
  }
}

async function _startNewCertification({
  userId,
  sessionId,
  userService,
  certificationChallengesService,
  certificationCourseRepository
}) {
  const newCertificationCourse = new CertificationCourse({ userId, sessionId });

  const userCompetencesProfileV1 = await userService.getProfileToCertifyV1(userId, new Date());
  const userCompetencesProfileV2 = await userService.getProfileToCertifyV2(userId, new Date());

  const userCompetencesToCertify = _selectProfileToCertify(userCompetencesProfileV1, userCompetencesProfileV2);

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
