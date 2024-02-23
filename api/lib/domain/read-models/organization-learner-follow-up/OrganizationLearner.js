import dayjs from 'dayjs';
class OrganizationLearner {
  constructor({
    id,
    firstName,
    lastName,
    division,
    email,
    username,
    authenticationMethods,
    group,
    isCertifiableFromCampaign,
    certifiableAtFromCampaign,
    isCertifiableFromLearner,
    certifiableAtFromLearner,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.division = division;
    this.group = group;
    this.username = username;
    this.authenticationMethods = authenticationMethods;

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
      this.certifiableAt = isCertifiableFromCampaign ? certifiableAtFromCampaign : null;
    } else {
      this.isCertifiable = isCertifiableFromLearner;
      this.certifiableAt = certifiableAtFromLearner;
    }
  }
}

export { OrganizationLearner };
