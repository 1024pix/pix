class OrganizationMember {
  constructor({ id, firstName, lastName } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

module.exports = OrganizationMember;
