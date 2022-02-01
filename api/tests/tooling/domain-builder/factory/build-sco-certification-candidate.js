const SCOCertificationCandidate = require('../../../../lib/domain/models/SCOCertificationCandidate');

module.exports = function buildSCOCertificationCandidate({
  id = 123,
  firstName = 'Myriam',
  lastName = 'Meilleure',
  birthdate = '2006-06-06',
  sex = 'F',
  birthINSEECode = '66001',
  sessionId = 456,
  schoolingRegistrationId = 789,
} = {}) {
  return new SCOCertificationCandidate({
    id,
    firstName,
    lastName,
    birthdate,
    sex,
    birthINSEECode,
    sessionId,
    schoolingRegistrationId,
  });
};
