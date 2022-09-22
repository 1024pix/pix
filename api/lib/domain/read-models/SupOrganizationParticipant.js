class SupOrganizationParticipant {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    studentNumber,
    group,
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
    this.birthdate = birthdate;
    this.studentNumber = studentNumber;
    this.group = group;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
    this.isCertifiable = isCertifiable;
  }
}

module.exports = SupOrganizationParticipant;
