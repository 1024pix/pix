const faker = require('faker');
const moment = require('moment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

module.exports = function buildCertificationCourse(
  {
    id = faker.random.number(),
    // attributes
    birthplace = faker.address.city(),
    birthdate = moment(faker.date.past(25)).format('DD/MM/YYYY'),
    createdAt = faker.date.past(1),
    updatedAt = faker.date.recent(),
    completedAt = faker.date.recent(),
    externalId = faker.random.uuid(),
    firstName = faker.name.firstName(),
    isPublished = faker.random.boolean(),
    lastName = faker.name.lastName(),
    nbChallenges = faker.random.number(40),
    isV2Certification = false,
    // includes
    // references
    userId = faker.random.number(),
    sessionId = faker.random.number(),
  } = {}) {

  const certificationCourse = new CertificationCourse({
    id,
    birthdate,
    birthplace,
    createdAt,
    updatedAt,
    completedAt,
    externalId,
    firstName,
    isPublished,
    lastName,
    nbChallenges,
    isV2Certification,
    sessionId,
    userId,
  });

  return certificationCourse;
};
