const JuryCertification = require('../../../../lib/domain/models/JuryCertification');
const buildCleaCertificationResult = require('./build-clea-certification-result');
const buildPixPlusDroitCertificationResult = require('./build-pix-plus-droit-certification-result');
const buildCertificationIssueReport = require('./build-certification-issue-report');
const buildCompetenceMark = require('./build-competence-mark');

const buildJuryCertification = function({
  certificationCourseId = 123,
  sessionId = 456,
  userId = 789,
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
  cleaCertificationResult = buildCleaCertificationResult.notTaken(),
  pixPlusDroitMaitreCertificationResult = buildPixPlusDroitCertificationResult.maitre.notTaken(),
  pixPlusDroitExpertCertificationResult = buildPixPlusDroitCertificationResult.expert.notTaken(),
  certificationIssueReports = [buildCertificationIssueReport()],
} = {}) {
  return new JuryCertification({
    certificationCourseId,
    sessionId,
    userId,
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
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
  });
};

module.exports = buildJuryCertification;
