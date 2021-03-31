const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

module.exports = function buildCertificationCandidate({
  id = 123,
  firstName = 'Poison',
  lastName = 'Ivy',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'poison.ivy@example.net',
  resultRecipientEmail = 'napoleon@example.net',
  birthdate = '1990-05-06',
  extraTimePercentage = 0.3,
  externalId = 'externalId',
  hasSeendEndTestScreen = false,
  createdAt = new Date('2020-01-01'),
  sessionId = 456,
  userId = 789,
  schoolingRegistrationId,
} = {}) {

  return new CertificationCandidate({
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
    hasSeendEndTestScreen,
    createdAt,
    userId,
    schoolingRegistrationId,
  });
};
