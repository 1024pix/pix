import { EventHandler } from '../../../../shared/application/jobs/event-handler.js';
import { EVENTS } from '../../../../shared/constants.js';
import * as usecases from '../../domain/usecases/index.js';

export class AnonymizeLearnersAndCampaignParticipationsEventHandler extends EventHandler {
  constructor() {
    super('AnonymizeLearnersAndCampaignParticipationsJob', EVENTS.ANONYMIZE_USER_BY_ADMIN);
  }

  async handle({ data, dependencies = { usecases } }) {
    await dependencies.usecases.anonymizeUser({ userId: data.userId });
  }
}
