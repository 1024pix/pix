class CampaignParticipationResultsShared {
  constructor({ campaignId, campaignParticipationId, userId, organizationId } = {}) {
    this.campaignId = campaignId;
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.organizationId = organizationId;
  }
}

module.exports = CampaignParticipationResultsShared;
