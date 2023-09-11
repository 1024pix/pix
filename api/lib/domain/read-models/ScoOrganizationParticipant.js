import dayjs from 'dayjs';
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
    isCertifiableFromLearner,
    certifiableAtFromLearner,
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

    this._buildCertificability({
      isCertifiableFromCampaign,
      certifiableAtFromCampaign,
      isCertifiableFromLearner,
      certifiableAtFromLearner,
    });
  }

  _buildCertificability({
    isCertifiableFromCampaign,
    certifiableAtFromCampaign,
    isCertifiableFromLearner,
    certifiableAtFromLearner,
  }) {
    const isCertifiableFromCampaignMostRecent =
      certifiableAtFromLearner === null || dayjs(certifiableAtFromCampaign).isAfter(dayjs(certifiableAtFromLearner));

    if (isCertifiableFromCampaignMostRecent) {
      this.isCertifiable = isCertifiableFromCampaign;
      this.certifiableAt = certifiableAtFromCampaign;
    } else {
      this.isCertifiable = isCertifiableFromLearner;
      this.certifiableAt = certifiableAtFromLearner;
    }
  }
}

export { ScoOrganizationParticipant };
