class SchoolLearner {
  constructor({ id, firstName, lastName, organizationId, division } = {}) {
    this.id = id;
    this.organizationId = organizationId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.division = division;
  }
}

export { SchoolLearner };
