class CampaignParticipation {

  constructor({ id, campaignId, assessmentId } = {}) {
    this.id = id;
    this.campaignId = campaignId;
    this.assessmentId = assessmentId;
  }
}

module.exports = CampaignParticipation;
