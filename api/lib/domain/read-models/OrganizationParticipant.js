class OrganizationParticipant {
  constructor({ id, firstName, lastName, participationCount, lastParticipationDate } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
  }
}

module.exports = OrganizationParticipant;
