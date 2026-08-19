import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { EVENTS } from '../../../shared/constants.js';
import { lastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';

export class AnonymizeLastUserApplicationConnectionsEventHandler extends EventHandler {
  constructor() {
    super('AnonymizeLastUserApplicationConnectionsJob', EVENTS.ANONYMIZE_USER_BY_ADMIN);
  }

  async handle({ data, dependencies = { lastUserApplicationConnectionsRepository } }) {
    const lastUserApplicationConnections = await dependencies.lastUserApplicationConnectionsRepository.findByUserId(
      data.userId,
    );

    for (const lastUserApplicationConnection of lastUserApplicationConnections) {
      const anonymized = lastUserApplicationConnection.anonymize();
      await dependencies.lastUserApplicationConnectionsRepository.upsert(anonymized);
    }
  }
}
