class OrganizationLearner {
  constructor({ id, lastName, firstName, division, organizationId } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.division = division;
    this.organizationId = organizationId;
  }
}

export { OrganizationLearner };
