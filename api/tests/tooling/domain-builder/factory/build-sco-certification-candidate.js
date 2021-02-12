const SCOCertificationCandidate = require('../../../../lib/domain/models/SCOCertificationCandidate');

module.exports = function buildSCOCertificationCandidate({
  id = 123,
  firstName = 'Myriam',
  lastName = 'Meilleure',
  birthdate = '2006-06-06',
  sessionId = 456,
  schoolingRegistrationId = 789,
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
