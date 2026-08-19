import { EventHandler } from '../../shared/application/jobs/event-handler.js';
import { EVENTS } from '../../shared/constants.js';
import * as userAcceptanceRepository from '../infrastructure/repositories/user-acceptance.repository.js';

export class RemoveLegalDocumentByUserEventHandler extends EventHandler {
  constructor() {
    super('removeLegalDocumentByUserJob', EVENTS.ANONYMIZE_USER_BY_ADMIN);
  }

  async handle({ data, dependencies = { userAcceptanceRepository } }) {
    await dependencies.userAcceptanceRepository.removeAllByUserId({ userId: data.userId });
  }
}
