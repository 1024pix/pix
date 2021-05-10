const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const buildAssessmentResult = require('./build-assessment-result');
const buildCleaCertificationResult = require('./build-clea-certification-result');
const buildPixPlusDroitCertificationResult = require('./build-pix-plus-droit-certification-result');

module.exports = function buildCertificationResult({
  id = '123',
  lastAssessmentResult,
  certificationIssueReports = [],
  firstName = 'Malik',
  lastName = 'Wayne',
  birthplace = 'Perpignan',
  birthdate = '2000-08-30',
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-05-05'),
  isPublished = true,
  isV2Certification = true,
  cleaCertificationResult = buildCleaCertificationResult.notTaken(),
  pixPlusDroitMaitreCertificationResult = buildPixPlusDroitCertificationResult.maitre.notTaken(),
  pixPlusDroitExpertCertificationResult = buildPixPlusDroitCertificationResult.expert.notTaken(),
  hasSeenEndTestScreen = true,
  assessmentId,
  sessionId,
  isCourseCancelled = false,
} = {}) {
  lastAssessmentResult = buildAssessmentResult({ ...lastAssessmentResult });
  return new CertificationResult({
    id,
    lastAssessmentResult,
    firstName,
    lastName,
    birthdate,
    birthplace,
    externalId,
    completedAt,
    createdAt,
    isPublished,
    isV2Certification,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
    isCourseCancelled,
  });
};
