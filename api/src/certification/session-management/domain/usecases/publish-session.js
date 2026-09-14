import { PublishSessionEvent } from '../../../../shared/domain/events/PublishSessionEvent.js';

export async function publishSession({ sessionId, eventJobPublisherService }) {
  await eventJobPublisherService.publishEvent(new PublishSessionEvent(sessionId));
}
