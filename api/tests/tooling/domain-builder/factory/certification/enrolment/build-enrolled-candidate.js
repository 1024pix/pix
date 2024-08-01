import { EnrolledCandidate } from '../../../../../../src/certification/enrolment/domain/read-models/EnrolledCandidate.js';

const buildEnrolledCandidate = function ({
  id = 123,
  firstName = 'Poison',
  lastName = 'Ivy',
  sex = 'F',
  birthPostalCode = null,
  birthINSEECode = '75101',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'poison.ivy@example.net',
  resultRecipientEmail = 'napoleon@example.net',
  birthdate = '1990-05-06',
  extraTimePercentage = 0.3,
  externalId = 'externalId',
  sessionId = 456,
  organizationLearnerId,
  billingMode = null,
  prepaymentCode = null,
  isLinked = false,
  subscriptions = [],
} = {}) {
  return new EnrolledCandidate({
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    organizationLearnerId,
    billingMode,
    prepaymentCode,
    isLinked,
    subscriptions,
  });
};

export { buildEnrolledCandidate };
