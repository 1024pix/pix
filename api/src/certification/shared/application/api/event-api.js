import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CandidateEnrolledEvent } from '../../domain/models/events/CandidateEnrolledEvent.js';
import * as eventRepository from '../../infrastructure/repositories/event-repository.js';

/**
 * @function
 * @name pushCandidateEnrolledEvent
 *
 * @param {Object} params
 * @param {number} params.id
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.sex
 * @param {string} params.birthPostalCode
 * @param {string} params.birthINSEECode
 * @param {string} params.birthCity
 * @param {string} params.birthProvinceCode
 * @param {string} params.birthCountry
 * @param {string} params.email
 * @param {string} params.resultRecipientEmail
 * @param {string} params.externalId
 * @param {string} params.birthdate
 * @param {number} params.extraTimePercentage
 * @param {string} params.billingMode
 * @param {string} params.prepaymentCode
 * @param {string} params.subscription
 * @param {boolean} params.accessibilityAdjustmentNeeded
 * @param {number} params.sessionId
 * @param {number} params.organizationLearnerId
 * @returns {Promise<void>}
 */
export async function pushCandidateEnrolledEvent({
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
  externalId,
  birthdate,
  extraTimePercentage,
  billingMode,
  prepaymentCode,
  subscription,
  accessibilityAdjustmentNeeded,
  sessionId,
  organizationLearnerId,
}) {
  try {
    const event = new CandidateEnrolledEvent({
      candidateId: id,
      metadata: {
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
        externalId,
        birthdate,
        extraTimePercentage,
        billingMode,
        prepaymentCode,
        subscription,
        accessibilityAdjustmentNeeded,
        sessionId,
        organizationLearnerId,
      },
    });
    await eventRepository.push(event);
  } catch (err) {
    logger.warn(`Error in "pushCandidateEnrolledEvent" for ID ${id}: ${err}`);
  }
}
