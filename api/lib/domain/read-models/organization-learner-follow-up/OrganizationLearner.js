class OrganizationLearner {
  constructor({ id, firstName, lastName, division, email, username, authenticationMethods, group } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.division = division;
    this.group = group;
    this.username = username;
    this.authenticationMethods = authenticationMethods;
  }
}

module.exports = OrganizationLearner;
