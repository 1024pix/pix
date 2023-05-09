import { Event } from './Event.js';

class CampaignParticipationResultsShared extends Event {
  constructor({ campaignParticipationId } = {}) {
    super();
    this.campaignParticipationId = campaignParticipationId;
  }
}

export { CampaignParticipationResultsShared };
