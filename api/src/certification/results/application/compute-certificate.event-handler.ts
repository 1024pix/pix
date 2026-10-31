import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import {
  SessionPublishedEvent,
  type SessionPublishedEventProps,
} from '../../../shared/domain/events/SessionPublishedEvent.ts';
import { addCorrelationInfo } from '../../../shared/infrastructure/execution-context-manager.js';
import { usecases } from '../domain/usecases/index.js';

export class ComputeCertificateEventHandler extends EventHandler {
  constructor() {
    super('session-published.compute-certificate.event-queue', SessionPublishedEvent.eventName);
  }

  async handle({ data }: { data: SessionPublishedEventProps }) {
    const event = new SessionPublishedEvent(data);
    const sessionId = event.payload.sessionId;
    addCorrelationInfo('sessionId', sessionId);
    await usecases.computeCertificatesForSession({ sessionId });
  }
}
