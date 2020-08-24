class Prescriber {

  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    areNewYearSchoolingRegistrationsImported,
    // includes
    memberships = [],
    userOrgaSettings,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.areNewYearSchoolingRegistrationsImported = areNewYearSchoolingRegistrationsImported;
    // includes
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
  }
}

module.exports = Prescriber;

