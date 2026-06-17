import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { Event } from '../../domain/models/Event.js';
import * as eventRepository from '../../infrastructure/repositories/event-repository.js';

/**
 * @typedef {Object} DTOEvent
 * @property {string} name
 * @property {number} candidateId
 * @property {Date} createdAt
 * @property {object} metadata
 */

/**
 * @function
 * @name pushEvents
 * @param {DTOEvent[]} dtoEvents
 * @returns {Promise<void>}
 */
export async function pushEvents(dtoEvents) {
  const events = [];
  for (const dtoEvent of dtoEvents) {
    const event = new Event({
      id: null,
      ...dtoEvent,
    });
    events.push(event);
  }
  if (events.length === 0) {
    return;
  }
  try {
    await eventRepository.push(events);
  } catch (error) {
    logger.warn(
      {
        event: 'certification-events-push',
        error,
      },
      `Error while pushing certification events ${events.map(({ name, candidateId }) => `${name}:${candidateId}`).join(', ')}`,
    );
  }
}
