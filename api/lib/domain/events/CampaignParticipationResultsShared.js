class CampaignParticipationResultsShared {
  constructor({ campaignId, isAssessment, campaignParticipationId, userId, organizationId } = {}) {
    this.campaignId = campaignId;
    this.isAssessment = isAssessment;
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.organizationId = organizationId;
  }
}

module.exports = CampaignParticipationResultsShared;
