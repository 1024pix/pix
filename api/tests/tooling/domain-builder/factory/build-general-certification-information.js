const buildCertificationIssueReport = require('./build-certification-issue-report');
const GeneralCertificationInformation = require('../../../../lib/domain/read-models/GeneralCertificationInformation');

module.exports = function buildGeneralCertificationInformation({
  certificationCourseId = 1234,

  sessionId = 567,
  createdAt = new Date('2018-12-01T01:02:03Z'),
  completedAt = new Date('2019-12-01T01:02:03Z'),
  isPublished = false,
  isCancelled = false,

  firstName = 'Diego',
  lastName = 'De La Vega',
  birthdate = '1990-05-06',
  birthplace = 'Mexico',
  birthCountry = 'CUBA',
  birthPostalCode = null,
  birthINSEECode = '99407',
  sex = 'M',
  userId = 123,

  certificationIssueReports = buildCertificationIssueReport.notImpactful(),
} = {}) {
  return new GeneralCertificationInformation({
    certificationCourseId,

    sessionId,
    createdAt,
    completedAt,
    isPublished,
    isCancelled,

    firstName,
    lastName,
    birthdate,
    birthplace,
    birthCountry,
    birthPostalCode,
    birthINSEECode,
    sex,
    userId,

    certificationIssueReports,
  });
};
