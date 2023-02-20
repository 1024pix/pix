import Event from './Event';

class CampaignParticipationResultsShared extends Event {
  constructor({ campaignParticipationId } = {}) {
    super();
    this.campaignParticipationId = campaignParticipationId;
  }
}

export default CampaignParticipationResultsShared;
