class AttachedOrganization {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {string} params.name
   * @param {string} params.externalId
   */
  constructor({ id, name, externalId } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
  }
}

export { AttachedOrganization };
