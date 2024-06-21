import { ReconcileCommonOrganizationLearnerError } from '../errors.js';

class CommonOrganizationLearner {
  constructor({ id, userId, lastName, firstName, organizationId, ...attributes } = {}) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.organizationId = organizationId;

    if (attributes) this.attributes = attributes;
    if (id) this.id = id;
    if (userId) this.userId = userId;
  }

  updateLearner({ learnerList, unicityKey }) {
    const existingLearner = learnerList.find((learner) => {
      return unicityKey.every((key) => {
        if (['firstName', 'lastName'].includes(key)) return this[key] === learner[key];
        else return this.attributes[key] === learner.attributes[key];
      });
    });

    if (existingLearner) {
      this.id = existingLearner.id;
      this.userId = existingLearner.userId;
    }
  }

  reconcileUser(userId) {
    if (this.userId) {
      throw new ReconcileCommonOrganizationLearnerError('USER_ALREADY_ERCONCILE');
    }
    this.userId = userId;
  }
}
export { CommonOrganizationLearner };
