const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const CertificationReport = require('../../../lib/domain/models/CertificationReport');
const _ = require('lodash');

module.exports = function buildCertificationReport({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  hasSeenEndTestScreen = false,
  certificationCourseId,
  sessionId,
} = {}) {

  certificationCourseId = _.isUndefined(certificationCourseId)
    ? buildCertificationCourse({ firstName, lastName, sessionId, hasSeenEndTestScreen }).id
    : certificationCourseId;

  const id = CertificationReport.idFromCertificationCourseId(certificationCourseId);

  const values = {
    id,
    firstName,
    lastName,
    hasSeenEndTestScreen,
    certificationCourseId,
  };
  return values;
};
