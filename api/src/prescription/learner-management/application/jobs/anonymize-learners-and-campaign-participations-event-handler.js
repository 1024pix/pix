import { AnonymizeUserEvent } from '../../../../privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../../shared/application/jobs/event-handler.js';
import { usecases } from '../../domain/usecases/index.js';

export class AnonymizeLearnersAndCampaignParticipationsEventHandler extends EventHandler {
  constructor() {
    super('anonymize-user.learners-and-campaign-participations.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new AnonymizeUserEvent(data);
    await dependencies.usecases.anonymizeUser({ userId: event.userId });
  }
}
