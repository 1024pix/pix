const buildCertificationCourse = require('./build-certification-course');
const CertificationReport = require('../../../lib/domain/models/CertificationReport');
const _ = require('lodash');

module.exports = function buildCertificationReport({
  firstName = 'Bobby',
  lastName = 'Lapointe',
  isCompleted = true,
  hasSeenEndTestScreen = false,
  certificationCourseId,
  sessionId,
  abortReason = null,
} = {}) {
  certificationCourseId = _.isUndefined(certificationCourseId)
    ? buildCertificationCourse({ firstName, lastName, sessionId, hasSeenEndTestScreen }).id
    : certificationCourseId;

  const id = CertificationReport.idFromCertificationCourseId(certificationCourseId);

  const values = {
    id,
    firstName,
    lastName,
    isCompleted,
    hasSeenEndTestScreen,
    certificationCourseId,
    abortReason,
  };
  return values;
};
