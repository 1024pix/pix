const faker = require('faker');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { statuses: cleaStatuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function buildCertificationResult({
  id = faker.random.uuid(),
  lastAssessmentResult,
  certificationIssueReports = [],
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthplace = faker.address.city(),
  birthdate = faker.date.past(),
  externalId = faker.random.number(),
  completedAt = faker.date.past(),
  createdAt = faker.date.past(),
  isPublished = faker.random.boolean(),
  isV2Certification = true,
  cleaCertificationStatus = cleaStatuses.NOT_PASSED,
  hasSeenEndTestScreen = faker.random.boolean(),
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
