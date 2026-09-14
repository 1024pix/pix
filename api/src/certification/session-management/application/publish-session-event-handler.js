import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { PublishSessionEvent } from '../../../shared/domain/events/PublishSessionEvent.js';
import { usecases } from '../domain/usecases/index.js';

export class PublishSessionEventHandler extends EventHandler {
  constructor() {
    super('publish-session.event-queue', PublishSessionEvent.eventName);
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new PublishSessionEvent(data.sessionId, data.publishedAt);
    await dependencies.usecases.sessionPublication(event.payload);
  }
}
