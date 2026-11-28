import { EventHandler } from '../../shared/application/jobs/event-handler.js';
import { JobTeam } from '../../shared/application/jobs/job-controller.js';
import { AnonymizeUserEvent } from '../../shared/domain/events/AnonymizeUserEvent.js';
import * as userAcceptanceRepository from '../infrastructure/repositories/user-acceptance.repository.js';

export class RemoveLegalDocumentByUserEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.legal-documents.event-queue', AnonymizeUserEvent.eventName, {
      description:
        "À l'anonymisation d'un utilisateur, supprime ses acceptations de documents légaux (CGU, politique de confidentialité).",
      team: JobTeam.ACCES,
    });
  }

  async handle({ data, dependencies = { userAcceptanceRepository } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.userAcceptanceRepository.removeAllByUserId(event.userId);
  }
}
