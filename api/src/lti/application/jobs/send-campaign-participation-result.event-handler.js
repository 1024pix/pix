import { EventHandler } from '../../../shared/application/jobs/event-handler.js';
import { CampaignSharedEvent } from '../../../shared/domain/events/CampaignSharedEvent.ts';
import { addCorrelationInfos } from '../../../shared/infrastructure/execution-context-manager.js';
import { usecases } from '../../domain/usecases/index.js';

export class SendCampaignParticipationResultEventHandler extends EventHandler {
  constructor() {
    super('campaign-participation-shared.lti.event-queue', CampaignSharedEvent.eventName);
  }

  async handle({ data, dependencies = { usecases } }) {
    const event = new CampaignSharedEvent(data);
    const { campaignId, campaignParticipationId, userId, sharedAt } = event.payload;
    addCorrelationInfos({ campaignId, campaignParticipationId });

    await dependencies.usecases.sendCampaignParticipationResult({
      campaignId,
      campaignParticipationId,
      userId,
      // the event payload is serialized as JSON by the job queue: sharedAt is received as an ISO string
      sharedAt: new Date(sharedAt),
    });
  }
}
