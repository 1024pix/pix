const faker = require('faker');
const moment = require('moment');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

module.exports = function buildCertificationCandidate(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    birthplace = faker.address.city(),
    birthdate = moment(faker.date.past(10)).format('YYYY-MM-DD'),
    createdAt = faker.date.past(1),
    extraTimePercentage = 0.3,
    externalId = faker.random.uuid(),
    // includes
    // references
    sessionId = faker.random.number(),
  } = {}) {

  const certificationCandidate = new CertificationCandidate({
    id,
    firstName,
    lastName,
    birthplace,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
  });

  return certificationCandidate;
};
