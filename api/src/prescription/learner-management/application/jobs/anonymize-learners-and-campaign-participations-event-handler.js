import { EventHandler } from '../../../../shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { AnonymizeUserEvent } from '../../../../shared/domain/events/AnonymizeUserEvent.js';
import { usecases } from '../../domain/usecases/index.js';

export class AnonymizeLearnersAndCampaignParticipationsEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.learners-and-campaign-participations.event-queue', AnonymizeUserEvent.eventName, {
      description:
        "À l'anonymisation d'un utilisateur, anonymise ses prescrits (organization learners) et ses participations aux campagnes.",
      team: JobTeam.PRESCRIPTION,
    });
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.usecases.anonymizeUser({ userId: event.userId });
  }
}
