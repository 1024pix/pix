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
    attributes,
    isCertifiableFromCampaign,
    certifiableAtFromCampaign,
    isCertifiableFromLearner,
    organizationId,
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
    this.organizationId = organizationId;

    this._buildCertificability({
      isCertifiableFromCampaign,
      certifiableAtFromCampaign,
      isCertifiableFromLearner,
      certifiableAtFromLearner,
    });

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this[key] = value;
      });
    }
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
      this.certifiableAt = isCertifiableFromCampaign != null ? certifiableAtFromCampaign : null;
    } else {
      this.isCertifiable = isCertifiableFromLearner;
      this.certifiableAt = certifiableAtFromLearner;
    }
  }
}

export { OrganizationLearner };
