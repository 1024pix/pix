const faker = require('faker');
const moment = require('moment');
const SCOCertificationCandidate = require('../../../../lib/domain/models/SCOCertificationCandidate');

module.exports = function buildSCOCertificationCandidate(
  {
    id = faker.random.number(),
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    birthdate = moment(faker.date.past(10)).format('YYYY-MM-DD'),
    sessionId = faker.random.number(),
    schoolingRegistrationId = faker.random.number(),
  } = {}) {

  const scoCertificationCandidate = new SCOCertificationCandidate({
    id,
    firstName,
    lastName,
    birthdate,
    sessionId,
    schoolingRegistrationId,
  });

  return scoCertificationCandidate;
};
