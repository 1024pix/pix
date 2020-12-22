class CampaignParticipationOverview {

  constructor({
    id,
    createdAt,
    isShared,
    sharedAt,
    organizationName,
    assessmentState,
    campaignCode,
    campaignTitle,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.sharedAt = sharedAt;
    this.organizationName = organizationName;
    this.assessmentState = assessmentState;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
  }
}

module.exports = CampaignParticipationOverview;
