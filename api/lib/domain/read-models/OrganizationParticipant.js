class OrganizationParticipant {
  constructor({
    id,
    firstName,
    lastName,
    participationCount,
    lastParticipationDate,
    campaignName,
    campaignType,
    participationStatus,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
  }
}

module.exports = OrganizationParticipant;
