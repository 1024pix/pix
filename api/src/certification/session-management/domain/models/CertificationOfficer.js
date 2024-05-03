class CertificationOfficer {
  constructor({ id, firstName, lastName } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

export { CertificationOfficer };
