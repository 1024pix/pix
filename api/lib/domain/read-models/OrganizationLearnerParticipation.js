class OrganizationLearnerParticipation {
  constructor({ campaignType, campaignName, createdAt, sharedAt, status }) {
    this.campaignType = campaignType;
    this.campaignName = campaignName;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.status = status;
  }
}

module.exports = OrganizationLearnerParticipation;
