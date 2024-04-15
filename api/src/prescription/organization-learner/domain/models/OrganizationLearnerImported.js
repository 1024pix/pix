class OrganizationLearnerImported {
  constructor({ id, firstName, lastName, attributes } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this[key] = value;
      });
    }
  }
}

export { OrganizationLearnerImported };
