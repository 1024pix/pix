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
    isCertifiable,
    certifiableAt,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.division = division;
    this.group = group;
    this.username = username;
    this.authenticationMethods = authenticationMethods;
    this.isCertifiable = isCertifiable;
    this.certifiableAt = isCertifiable ? certifiableAt : null;
  }
}

module.exports = OrganizationLearner;
