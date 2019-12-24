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
    email = faker.internet.email(),
    birthdate = moment(faker.date.past(10)).format('YYYY-MM-DD'),
    createdAt = faker.date.past(1),
    extraTimePercentage = 0.3,
    externalId = faker.random.uuid(),
    // includes
    // references
    sessionId = faker.random.number(),
    userId = faker.random.number(),
  } = {}) {

  const certificationCandidate = new CertificationCandidate({
    id,
    firstName,
    lastName,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    userId,
  });

  return certificationCandidate;
};
