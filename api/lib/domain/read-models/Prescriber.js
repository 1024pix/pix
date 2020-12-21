class Prescriber {

  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    areNewYearSchoolingRegistrationsImported,
    memberships = [],
    userOrgaSettings,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.areNewYearSchoolingRegistrationsImported = areNewYearSchoolingRegistrationsImported;
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
  }
}

module.exports = Prescriber;

