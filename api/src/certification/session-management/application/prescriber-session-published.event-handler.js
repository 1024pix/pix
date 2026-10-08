import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.js';
import { addCorrelationInfo } from '../../../shared/infrastructure/execution-context-manager.js';
import { usecases } from '../domain/usecases/index.js';

export class PrescriberSessionPublishedEventHandler extends EventHandler {
  constructor() {
    super('session-published.prescriber.event-queue', SessionPublishedEvent.eventName);
  }

  async handle({ data }) {
    const event = new SessionPublishedEvent(data);
    const sessionId = event.payload.sessionId;
    addCorrelationInfo('sessionId', sessionId);
    await usecases.sendCleaSessionResultsToReferers({ sessionId });
  }
}
