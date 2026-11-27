import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { AnonymizeUserEvent } from '../../../shared/domain/events/AnonymizeUserEvent.js';
import { usecases } from '../../domain/usecases/index.js';

export class AnonymizeUserEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.event-queue', AnonymizeUserEvent.eventName, {
      description:
        "À l'anonymisation d'un utilisateur, anonymise son compte : données personnelles, méthodes d'authentification et données associées gérées par le contexte identité.",
      team: JobTeam.ACCES,
    });
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.usecases.anonymizeUser({ userId: event.userId, updatedByUserId: event.updatedByUserId });
  }
}
