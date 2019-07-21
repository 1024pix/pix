const faker = require('faker');
const moment = require('moment');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

module.exports = function buildCertificationCandidate(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    birthCountry = faker.address.country(),
    birthProvince = faker.address.state(),
    birthCity = faker.address.city(),
    birthdate = moment(faker.date.past(25)).format('DD/MM/YYYY'),
    createdAt = faker.date.past(1),
    extraTimePercentage = faker.random.number(40),
    externalId = faker.random.uuid(),
    // includes
    // references
    sessionId = faker.random.number(),
  } = {}) {

  const certificationCandidate = new CertificationCandidate({
    id,
    firstName,
    lastName,
    birthCountry,
    birthProvince,
    birthCity,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
  });

  return certificationCandidate;
};
