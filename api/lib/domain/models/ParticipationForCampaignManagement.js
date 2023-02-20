class ParticipationForCampaignManagement {
  constructor({
    id,
    lastName,
    firstName,
    userId,
    userFirstName,
    userLastName,
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
    this.userId = userId;
    this.userFullName = userFirstName + ' ' + userLastName;
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

export default ParticipationForCampaignManagement;
