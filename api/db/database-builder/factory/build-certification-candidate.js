import { Frameworks } from '../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';

export function buildCertificationCandidate({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  lastName = 'last-name',
  sex = 'M',
  birthPostalCode = null,
  birthINSEECode = '75101',
  birthCity = 'PARIS 1',
  birthProvinceCode = null,
  birthCountry = 'France',
  email = 'somemail@example.net',
  birthdate = '2000-01-04',
  resultRecipientEmail = 'somerecipientmail@example.net',
  sessionId,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  extraTimePercentage = 0.3,
  userId,
  organizationLearnerId = null,
  billingMode = null,
  prepaymentCode = null,
  hasSeenCertificationInstructions = false,
  accessibilityAdjustmentNeeded = false,
  reconciledAt = null,
  subscription = Frameworks.CORE,
  authorizedToStartAt = null,
} = {}) {
  if (!sessionId) {
    sessionId = buildSession().id;
  }

  if (!userId && reconciledAt) {
    userId = buildUser().id;
  }
  reconciledAt = userId && !reconciledAt ? new Date('2020-01-02') : reconciledAt;

  const values = {
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
    createdAt,
    userId,
    organizationLearnerId,
    billingMode,
    prepaymentCode,
    hasSeenCertificationInstructions,
    accessibilityAdjustmentNeeded,
    reconciledAt,
    subscription,
    authorizedToStartAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-candidates',
    values,
  });

  return {
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
    createdAt,
    userId,
    organizationLearnerId,
    billingMode,
    prepaymentCode,
    hasSeenCertificationInstructions,
    accessibilityAdjustmentNeeded,
    reconciledAt,
    subscription,
  };
}
