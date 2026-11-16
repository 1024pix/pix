import { Frameworks } from '../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';

/**
 * @typedef {object} CertificationCandidateRow
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} sex
 * @property {string | null} birthPostalCode
 * @property {string | null} birthINSEECode
 * @property {string} birthCity
 * @property {string | null} birthProvinceCode
 * @property {string} birthCountry
 * @property {string | null} email
 * @property {string | null} resultRecipientEmail
 * @property {string} birthdate
 * @property {number} sessionId
 * @property {string | null} externalId
 * @property {number | null} extraTimePercentage
 * @property {Date} createdAt
 * @property {number | null | undefined} userId
 * @property {number | null} organizationLearnerId
 * @property {'FREE' | 'PAID' | 'PREPAID' | null} billingMode
 * @property {string | null} prepaymentCode
 * @property {boolean} hasSeenCertificationInstructions
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {Date | null} reconciledAt
 * @property {Frameworks} subscription
 */

/**
 * Builds a certification candidate and pushes it into the database buffer.
 * If `sessionId` is not provided, a session is built as well.
 * If `userId` is not provided but `reconciledAt` is, a user is built as well.
 * If `userId` is provided without `reconciledAt`, the candidate is considered reconciled on 2020-01-02.
 *
 * @param {undefined | object} params
 * @param {undefined | number} params.id
 * @param {undefined | string} params.firstName
 * @param {undefined | string} params.lastName
 * @param {undefined | string} params.sex
 * @param {undefined | string | null} params.birthPostalCode
 * @param {undefined | string | null} params.birthINSEECode
 * @param {undefined | string} params.birthCity
 * @param {undefined | string | null} params.birthProvinceCode
 * @param {undefined | string} params.birthCountry
 * @param {undefined | string | null} params.email
 * @param {undefined | string} params.birthdate
 * @param {undefined | string | null} params.resultRecipientEmail
 * @param {undefined | number} params.sessionId
 * @param {undefined | string | null} params.externalId
 * @param {undefined | Date} params.createdAt
 * @param {undefined | number | null} params.extraTimePercentage
 * @param {undefined | number | null} params.userId
 * @param {undefined | number | null} params.organizationLearnerId
 * @param {undefined | 'FREE' | 'PAID' | 'PREPAID' | null} params.billingMode
 * @param {undefined | string | null} params.prepaymentCode
 * @param {undefined | boolean} params.hasSeenCertificationInstructions
 * @param {undefined | boolean} params.accessibilityAdjustmentNeeded
 * @param {undefined | Date | null} params.reconciledAt
 * @param {undefined | Frameworks} params.subscription
 * @param {undefined | Date | null} params.authorizedToStartAt
 * @returns {CertificationCandidateRow}
 */
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
