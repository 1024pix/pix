import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CandidateEnrolledEvent } from '../../domain/models/events/CandidateEnrolledEvent.js';
import * as eventRepository from '../../infrastructure/repositories/event-repository.js';

/**
 * @typedef {Object} DtoCandidate
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
 * @param {DtoCandidate} dtoCandidate
 * @returns {Promise<void>}
 */
export async function pushCandidateEnrolledEvent(dtoCandidate) {
  await _pushCandidateEnrolledEvents([dtoCandidate]);
}

/**
 * @function
 * @name pushCandidateEnrolledEvent
 * @param {DtoCAndidate[]} dtoCandidates
 * @returns {Promise<void>}
 */
export async function pushMultipleCandidatesEnrolledEvent(dtoCandidates) {
  await _pushCandidateEnrolledEvents(dtoCandidates);
}

async function _pushCandidateEnrolledEvents(dtoEnrolledCandidates) {
  const events = [];
  for (const dtoEnrolledCandidate of dtoEnrolledCandidates) {
    const event = new CandidateEnrolledEvent({
      candidateId: dtoEnrolledCandidate.id,
      metadata: dtoEnrolledCandidate,
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
