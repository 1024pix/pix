class Prescriber {

  constructor({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    // includes
    memberships = [],
    userOrgaSettings,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    // includes
    this.memberships = memberships;
    this.userOrgaSettings = userOrgaSettings;
  }
}

module.exports = Prescriber;

