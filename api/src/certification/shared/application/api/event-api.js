import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CandidateEnrolledEvent } from '../../domain/models/events/CandidateEnrolledEvent.js';
import * as eventRepository from '../../infrastructure/repositories/event-repository.js';

/**
 * @typedef {Object} CandidateEnrolledParams
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} sex
 * @property {string} birthPostalCode
 * @property {string} birthINSEECode
 * @property {string} birthCity
 * @property {string} birthProvinceCode
 * @property {string} birthCountry
 * @property {string} email
 * @property {string} resultRecipientEmail
 * @property {string} externalId
 * @property {string} birthdate
 * @property {number} extraTimePercentage
 * @property {string} billingMode
 * @property {string} prepaymentCode
 * @property {string} subscription
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {number} sessionId
 * @property {number} organizationLearnerId
 */

/**
 * @function
 * @name pushCandidateEnrolledEvent
 * @param {CandidateEnrolledParams} candidateParams
 * @returns {Promise<void>}
 */
export async function pushCandidateEnrolledEvent(candidateParams) {
  await _pushCandidateEnrolledEvents([candidateParams]);
}

/**
 * @function
 * @name pushCandidateEnrolledEvent
 * @param {CandidateEnrolledParams[]} manyCandidatesParams
 * @returns {Promise<void>}
 */
export async function pushMultipleCandidatesEnrolledEvent(manyCandidatesParams) {
  await _pushCandidateEnrolledEvents(manyCandidatesParams);
}

async function _pushCandidateEnrolledEvents(candidateEnrolledParamsArray) {
  const events = [];
  for (const candidateEnrolledParams of candidateEnrolledParamsArray) {
    const event = new CandidateEnrolledEvent({
      candidateId: candidateEnrolledParams.id,
      metadata: candidateEnrolledParams,
    });
    events.push(event);
  }
  try {
    await eventRepository.push(events);
  } catch (err) {
    logger.warn(
      `Error in "_pushCandidateEnrolledEvents" for IDs ${events.map(({ candidateId }) => candidateId).join(', ')}: ${err}`,
    );
  }
}
