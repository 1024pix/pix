const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { statuses: cleaStatuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const buildAssessmentResult = require('./build-assessment-result');

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
  cleaCertificationStatus = cleaStatuses.NOT_PASSED,
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
    cleaCertificationStatus,
    certificationIssueReports,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
  });
};
