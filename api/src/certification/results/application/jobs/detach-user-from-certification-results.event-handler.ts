import { EventHandler } from '../../../../shared/application/jobs/event-handler.js';
import { AnonymizeUserEvent } from '../../../../shared/domain/events/AnonymizeUserEvent.js';
import { usecases } from '../../domain/usecases/index.js';

export class DetachUserFromCertificationResultsEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.certification-results.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data }: { data: { userId: number } }) {
    await usecases.detachUserFromCertificationResults({ userId: data.userId });
  }
}
