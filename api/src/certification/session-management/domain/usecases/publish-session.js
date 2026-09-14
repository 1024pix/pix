import { NotFoundError } from '../../../../shared/domain/errors.js';
import { PublishSessionEvent } from '../../../../shared/domain/events/PublishSessionEvent.js';

export async function publishSession({ sessionId, publishedAt, eventJobPublisherService, sessionRepository }) {
  const session = await sessionRepository.get({ id: sessionId });

  if (!session) {
    throw new NotFoundError('Session not found');
  }
  const publishSessionEvent = new PublishSessionEvent({ sessionId, publishedAt });
  await eventJobPublisherService.publishEvent(publishSessionEvent);
}
