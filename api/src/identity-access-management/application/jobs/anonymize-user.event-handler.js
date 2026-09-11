import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { AnonymizeUserEvent } from '../../../shared/domain/events/AnonymizeUserEvent.js';
import { usecases } from '../../domain/usecases/index.js';

export class AnonymizeUserEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.usecases.anonymizeUser({ userId: event.userId, updatedByUserId: event.updatedByUserId });
  }
}
