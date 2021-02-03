const faker = require('faker');
const Session = require('../../../../lib/domain/models/Session');

module.exports = function buildFinalizedSession({
  sessionId = faker.random.number(),
  certificationCenterName = faker.company.companyName(),
  sessionDate = '2020-12-01',
  sessionTime = '14:30',
  finalizedAt = '2021-01-12',
  publishedAt = null,
  isPublishable = faker.random.boolean(),
} = {}) {
  return new Session({
    sessionId,
    certificationCenterName,
    sessionDate,
    sessionTime,
    finalizedAt,
    publishedAt,
    isPublishable,
  });
};
