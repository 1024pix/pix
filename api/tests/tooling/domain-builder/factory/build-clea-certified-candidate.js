import CleaCertifiedCandidate from '../../../../lib/domain/read-models/CleaCertifiedCandidate';

export default function buildCleaCertifiedCandidate({
  firstName = 'Gandhi',
  lastName = 'Matmatah',
  resultRecipientEmail = 'matmatahGdu75@dhi.fr',
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
    resultRecipientEmail,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    createdAt,
  });
}
