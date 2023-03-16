class OrganizationLearnerParticipation {
  constructor({ id, campaignType, campaignName, createdAt, sharedAt, status, campaignId }) {
    this.id = id;
    this.campaignType = campaignType;
    this.campaignName = campaignName;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.status = status;
    this.campaignId = campaignId;
  }
}

module.exports = OrganizationLearnerParticipation;
