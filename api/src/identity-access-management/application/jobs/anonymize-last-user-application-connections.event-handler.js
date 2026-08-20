import { AnonymizeUserEvent } from '../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { lastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';

export class AnonymizeLastUserApplicationConnectionsEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.last-application-connections.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { lastUserApplicationConnectionsRepository } }) {
    const event = new AnonymizeUserEvent(data);
    const lastUserApplicationConnections = await dependencies.lastUserApplicationConnectionsRepository.findByUserId(
      event.userId,
    );

    for (const lastUserApplicationConnection of lastUserApplicationConnections) {
      const anonymized = lastUserApplicationConnection.anonymize();
      await dependencies.lastUserApplicationConnectionsRepository.upsert(anonymized);
    }
  }
}
