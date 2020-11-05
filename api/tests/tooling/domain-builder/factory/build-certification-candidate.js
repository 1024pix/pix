const faker = require('faker');
const moment = require('moment');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

module.exports = function buildCertificationCandidate(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    birthCity = faker.address.city(),
    birthProvinceCode = faker.random.alphaNumeric(3),
    birthCountry = faker.address.country(),
    email = faker.internet.exampleEmail(),
    resultRecipientEmail = faker.internet.exampleEmail(),
    birthdate = moment(faker.date.past(10)).format('YYYY-MM-DD'),
    extraTimePercentage = 0.3,
    externalId = faker.random.uuid(),
    examinerComment = faker.lorem.sentence(),
    hasSeendEndTestScreen = false,
    createdAt = faker.date.past(1),
    // includes
    // references
    sessionId = faker.random.number(),
    userId = faker.random.number(),
    schoolingRegistrationId,
  } = {}) {

  const certificationCandidate = new CertificationCandidate({
    id,
    firstName,
    lastName,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    examinerComment,
    hasSeendEndTestScreen,
    createdAt,
    userId,
    schoolingRegistrationId,
  });

  return certificationCandidate;
};
