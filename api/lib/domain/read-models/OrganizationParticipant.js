class OrganizationParticipant {
  constructor({ id, firstName, lastName, participationCount } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participationCount = participationCount;
  }
}

module.exports = OrganizationParticipant;
