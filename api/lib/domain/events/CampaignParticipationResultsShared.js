const Event = require('./Event');

class CampaignParticipationResultsShared extends Event {
  constructor({ campaignParticipationId } = {}) {
    super();
    this.campaignParticipationId = campaignParticipationId;
  }
}

module.exports = CampaignParticipationResultsShared;
