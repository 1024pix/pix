class CampaignParticipationForUserManagement {
  constructor({
    id,
    participantExternalId,
    status,
    campaignId,
    campaignCode,
    createdAt,
    sharedAt,
    deletedAt,
    deletedBy,
    deletedByFirstName,
    deletedByLastName,
    organizationLearnerFirstName,
    organizationLearnerLastName,
  } = {}) {
    this.id = id;
    this.participantExternalId = participantExternalId;
    this.status = status;
    this.campaignId = campaignId;
    this.campaignCode = campaignCode;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    if (this.deletedAt) {
      this.deletedByFullName = deletedByFirstName + ' ' + deletedByLastName;
    }
    this.organizationLearnerFullName = organizationLearnerFirstName + ' ' + organizationLearnerLastName;
  }
}

export default CampaignParticipationForUserManagement;
