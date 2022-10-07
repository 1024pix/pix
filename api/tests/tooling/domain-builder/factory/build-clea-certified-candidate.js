const CleaCertifiedCandidate = require('../../../../lib/domain/read-models/CleaCertifiedCandidate');

module.exports = function buildCleaCertifiedCandidate({
  firstName = 'Gandhi',
  lastName = 'Matmatah',
  email = 'matmatahGdu75@dhi.fr',
  birthplace = 'Perpignan',
  birthdate = '1985-01-20',
  sex = 'F',
  birthPostalCode = '75005',
  birthINSEECode = '75112',
  birthCountry = 'FRANCE',
  createdAt = new Date('2020-02-01'),
} = {}) {
  return new CleaCertifiedCandidate({
    firstName,
    lastName,
    email,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    createdAt,
  });
};
