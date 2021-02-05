class Prescriber {

  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    areNewYearSchoolingRegistrationsImported,
    memberships = [],
    userOrgaSettings,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.lang = lang;
    this.areNewYearSchoolingRegistrationsImported = areNewYearSchoolingRegistrationsImported;
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
  }
}

module.exports = Prescriber;

