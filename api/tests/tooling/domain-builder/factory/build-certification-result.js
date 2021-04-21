const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const buildAssessmentResult = require('./build-assessment-result');
const buildCleaCertificationResult = require('./build-clea-certification-result');

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
  cleaCertificationResult = buildCleaCertificationResult.notPassed(),
  hasSeenEndTestScreen = true,
  assessmentId,
  sessionId,
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
    certificationIssueReports,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
  });
};
