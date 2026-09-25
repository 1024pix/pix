import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.js';

export class PrescriberSessionPublishedEventHandler extends EventHandler {
  constructor() {
    super('session-published.prescriber.event-queue', SessionPublishedEvent.eventName);
  }

  async handle({ data, dependencies = {} }) {
    const event = new SessionPublishedEvent(data);
  }
}
