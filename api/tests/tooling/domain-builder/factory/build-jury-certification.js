const JuryCertification = require('../../../../lib/domain/models/JuryCertification');
const buildCertificationIssueReport = require('./build-certification-issue-report');
const buildCompetenceMark = require('./build-competence-mark');

const buildJuryCertification = function ({
  certificationCourseId = 123,
  sessionId = 456,
  userId = 789,
  assessmentId = 159,
  firstName = 'Malik',
  lastName = 'Wayne',
  birthplace = 'Torreilles',
  birthdate = '2000-08-30',
  birthINSEECode = '66212',
  birthPostalCode = null,
  birthCountry = 'France',
  sex = 'M',
  status = 'validated',
  isPublished = true,
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-02-01'),
  pixScore = 55,
  juryId = 66,
  commentForCandidate = 'comment candidate',
  commentForOrganization = 'comment organization',
  commentForJury = 'comment jury',
  competenceMarks = [buildCompetenceMark()],
  certificationIssueReports = [buildCertificationIssueReport()],
  complementaryCertificationCourseResults = [],
} = {}) {
  return new JuryCertification({
    certificationCourseId,
    sessionId,
    userId,
    assessmentId,
    firstName,
    lastName,
    birthplace,
    birthdate,
    birthINSEECode,
    birthPostalCode,
    birthCountry,
    sex,
    status,
    isPublished,
    createdAt,
    completedAt,
    pixScore,
    juryId,
    commentForCandidate,
    commentForOrganization,
    commentForJury,
    competenceMarks,
    certificationIssueReports,
    complementaryCertificationCourseResults,
  });
};

module.exports = buildJuryCertification;
