const Campaign = require('./Campaign');

class UserWithOrganizationLearner {
  constructor({
    id,
    lastName,
    firstName,
    birthdate,
    userId,
    organizationId,
    username,
    email,
    isAuthenticatedFromGAR,
    studentNumber,
    division,
    group,
    participationCount,
    lastParticipationDate,
    campaignName,
    campaignType,
    participationStatus,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthdate = birthdate;
    this.userId = userId;
    this.organizationId = organizationId;
    this.username = username;
    this.email = email;
    this.isAuthenticatedFromGAR = isAuthenticatedFromGAR;
    this.studentNumber = studentNumber;
    this.division = division;
    this.group = group;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
  }
}

UserWithOrganizationLearner.campaignTypes = Campaign.types;

module.exports = UserWithOrganizationLearner;
