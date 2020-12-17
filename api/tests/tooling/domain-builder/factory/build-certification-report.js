const faker = require('faker');
const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const buildCertificationIssueReport = require('./build-certification-issue-report');

module.exports = function buildCertificationReport(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    hasSeenEndTestScreen = false,
    examinerComment,
    certificationIssueReports,
    // references
    certificationCourseId = faker.random.number(),
  } = {}) {

  return new CertificationReport({
    id,
    certificationCourseId,
    firstName,
    lastName,
    hasSeenEndTestScreen,
    examinerComment,
    certificationIssueReports: certificationIssueReports
      ? certificationIssueReports
      : [buildCertificationIssueReport({ certificationCourseId })],
  });
};
