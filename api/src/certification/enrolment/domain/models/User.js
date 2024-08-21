export class User {
  /**
   * @param {Object} params
   * @param {number} params.id - identifier of the user
   * @param {string} params.lang
   */
  constructor({ id, lang, organizationLearnerIds }) {
    this.id = id;
    this.lang = lang;
    this.organizationLearnerIds = organizationLearnerIds;
  }

  has({ organizationLearnerId }) {
    return this.organizationLearnerIds.some(
      (myOrganizationLearnerId) => myOrganizationLearnerId === organizationLearnerId,
    );
  }
}
