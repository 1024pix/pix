class ImportOrganizationLearnerSet {
  #learners;

  constructor() {
    this.#learners = [];

    // define validation rule
  }

  addLearner(learnerAttributes) {
    // validate line
    this.#learners.push(new CommonOrganizationLearner(learnerAttributes));
  }

  getLearners() {
    return this.#learners;
  }
}

class CommonOrganizationLearner {
  constructor({ id, userId, lastName, firstName, organizationId, attributes } = {}) {
    if (id) this.id = id;
    if (userId) this.userId = userId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.organizationId = organizationId;
    if (attributes) this.attributes = attributes;
  }
}

export { CommonOrganizationLearner, ImportOrganizationLearnerSet };
