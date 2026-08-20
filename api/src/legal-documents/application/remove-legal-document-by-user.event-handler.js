import { AnonymizeUserEvent } from '../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../shared/application/jobs/event-handler.js';
import * as userAcceptanceRepository from '../infrastructure/repositories/user-acceptance.repository.js';

export class RemoveLegalDocumentByUserEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.legal-documents.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { userAcceptanceRepository } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.userAcceptanceRepository.removeAllByUserId(event.userId);
  }
}
