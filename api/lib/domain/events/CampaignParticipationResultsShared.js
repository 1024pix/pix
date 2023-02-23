const Event = require('./Event.js');

class CampaignParticipationResultsShared extends Event {
  constructor({ campaignParticipationId } = {}) {
    super();
    this.campaignParticipationId = campaignParticipationId;
  }
}

module.exports = CampaignParticipationResultsShared;
