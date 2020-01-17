const faker = require('faker');
const moment = require('moment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

module.exports = function buildCertificationCourse(
  {
    id = faker.random.number(),
    // attributes
    birthplace = faker.address.city(),
    birthdate = moment(faker.date.past(25)).format('YYYY-MM-DD'),
    completedAt = faker.date.recent(),
    createdAt = faker.date.past(1),
    externalId = faker.random.uuid(),
    firstName = faker.name.firstName(),
    isPublished = faker.random.boolean(),
    lastName = faker.name.lastName(),
    nbChallenges = faker.random.number(40),
    isV2Certification = false,
    examinerComment = faker.lorem.sentence(),
    hasSeenEndTestScreen = false,
    // includes
    // references
    userId = faker.random.number(),
    sessionId = faker.random.number(),
  } = {}) {

  const certificationCourse = new CertificationCourse({
    id,
    birthdate,
    birthplace,
    completedAt,
    createdAt,
    externalId,
    firstName,
    isPublished,
    lastName,
    nbChallenges,
    isV2Certification,
    hasSeenEndTestScreen,
    examinerComment,
    sessionId,
    userId,
  });

  return certificationCourse;
};
