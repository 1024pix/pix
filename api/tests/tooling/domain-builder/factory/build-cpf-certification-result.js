const CpfCertificationResult = require('../../../../lib/domain/read-models/CpfCertificationResult');

module.exports = function buildCpfCertificationResult({
  id = 1234,
  firstName = 'John',
  lastName = 'Doe',
  birthdate = new Date('2000-01-01'),
  sex = 'M',
  birthINSEECode = '75115',
  birthPostalCode = '75015',
  birthplace = 'PARIS',
  birthCountry = 'FRANCE',
  publishedAt = new Date(),
  pixScore = 100,
  competenceMarks = [
    { competenceCode: '1.2', level: 3 },
    { competenceCode: '2.4', level: 5 },
  ],
} = {}) {
  return new CpfCertificationResult({
    id,
    firstName,
    lastName,
    birthdate,
    sex,
    birthINSEECode,
    birthPostalCode,
    birthplace,
    birthCountry,
    publishedAt,
    pixScore,
    competenceMarks,
  });
};
