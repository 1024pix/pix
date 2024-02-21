class OrganizationLearnerParticipation {
  constructor({
    id,
    campaignType,
    campaignName,
    createdAt,
    sharedAt,
    status,
    campaignId,
    participationCount,
    lastSharedOrCurrentCampaignParticipationId,
  }) {
    this.id = id;
    this.campaignType = campaignType;
    this.campaignName = campaignName;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.status = status;
    this.campaignId = campaignId;
    this.participationCount = participationCount;
    this.lastSharedOrCurrentCampaignParticipationId = lastSharedOrCurrentCampaignParticipationId || id;
  }
}

export { OrganizationLearnerParticipation };
