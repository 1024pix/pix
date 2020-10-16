const faker = require('faker');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { statuses: cleaStatuses } = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function buildCertificationResult({
  id = faker.random.uuid(),
  lastAssessmentResultFull,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthplace = faker.address.city(),
  birthdate = faker.date.past(),
  externalId = faker.random.number(),
  completedAt = faker.date.past(),
  createdAt = faker.date.past(),
  isPublished = faker.random.boolean(),
  isV2Certification = true,
  cleaCertificationStatus = faker.random.objectElement(cleaStatuses),
  examinerComment = faker.lorem.sentences(),
  hasSeenEndTestScreen = faker.random.boolean(),
  assessmentId,
  sessionId,
} = {}) {
  lastAssessmentResultFull = buildAssessmentResult({ ...lastAssessmentResultFull });
  return new CertificationResult({
    id,
    lastAssessmentResultFull,
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
    examinerComment,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
  });
};
