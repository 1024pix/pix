import { Candidate } from '../../../../../../src/certification/evaluation/domain/models/Candidate.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

export const buildEvaluationCandidate = function ({
  id = 123,
  userId = 456,
  sessionId = 789,
  firstName = 'foo firstName',
  lastName = 'foo lastName',
  sex = 'F',
  birthdate = '2000-01-01',
  birthPostalCode = '66000',
  birthINSEECode = null,
  birthCountry = 'France',
  birthCity = 'Perpignan',
  externalId = 'foo externalId',
  accessibilityAdjustmentNeeded = false,
  reconciledAt = new Date('2024-10-18'),
  subscriptionFramework = Frameworks.CORE,
  authorizedToStart = true,
} = {}) {
  return new Candidate({
    id,
    userId,
    sessionId,
    firstName,
    lastName,
    sex,
    birthdate,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    birthCity,
    externalId,
    accessibilityAdjustmentNeeded,
    reconciledAt,
    subscriptionFramework,
    authorizedToStart,
  });
};
