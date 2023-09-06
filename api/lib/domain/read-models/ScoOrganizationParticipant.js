class ScoOrganizationParticipant {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    userId,
    username,
    email,
    isAuthenticatedFromGAR,
    division,
    participationCount,
    lastParticipationDate,
    campaignName,
    campaignType,
    participationStatus,
    isCertifiableFromCampaign,
    certifiableAtFromCampaign,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.isAuthenticatedFromGAR = isAuthenticatedFromGAR;
    this.division = division;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
    this.isCertifiable = isCertifiableFromCampaign;
    this.certifiableAt = isCertifiableFromCampaign ? certifiableAtFromCampaign : null;
  }
}

export { ScoOrganizationParticipant };
