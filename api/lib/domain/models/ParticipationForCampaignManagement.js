class ParticipationForCampaignManagement {
  constructor({
    id,
    lastName,
    firstName,
    participantExternalId,
    status,
    createdAt,
    sharedAt,
    deletedAt,
    deletedBy,
    deletedByFirstName,
    deletedByLastName,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.participantExternalId = participantExternalId;
    this.status = status;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    if (this.deletedAt) {
      this.deletedByFullName = deletedByFirstName + ' ' + deletedByLastName;
    }
  }
}

module.exports = ParticipationForCampaignManagement;
