class Prescriber {

  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    areNewYearStudentsImported,
    // includes
    memberships = [],
    userOrgaSettings,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.areNewYearStudentsImported = areNewYearStudentsImported;
    // includes
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
  }
}

module.exports = Prescriber;

