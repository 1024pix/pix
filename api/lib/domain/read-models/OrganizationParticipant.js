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
    isCertifiable,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
    this.isCertifiable = isCertifiable;
  }
}

module.exports = OrganizationParticipant;
