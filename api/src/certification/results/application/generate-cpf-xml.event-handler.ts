import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { SessionPublishedEvent } from '../../../shared/domain/events/SessionPublishedEvent.ts';
import { type SessionPublishedEventProps } from '../../../shared/domain/events/SessionPublishedEvent.ts';
import { usecases } from '../domain/usecases/index.js';

export class GenerateCpfXmlEventHandler extends EventHandler {
  constructor() {
    super('session-published.generate-cpf-xml.event-queue', SessionPublishedEvent.eventName);
  }

  handle({ data, uuid }: { data: SessionPublishedEventProps; uuid?: string }) {
    return usecases.generateCpfXml({ sessionId: data.sessionId, uuid });
  }
}
