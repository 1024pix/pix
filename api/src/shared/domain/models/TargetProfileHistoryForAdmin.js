class TargetProfileHistoryForAdmin {
  /**
   * @param {Object} params
   * @param {number} params.id - target profile identifier
   * @param {string} params.name
   * @param {Array<Object>} params.badges - associated Pix core badges
   * @param {Date} params.attachedAt
   * @param {Date} [params.detachedAt] - empty when current badge is the one activated
   */
  constructor({ id, name, attachedAt, detachedAt = null, badges = [] }) {
    this.id = id;
    this.name = name;
    this.attachedAt = attachedAt;
    this.detachedAt = detachedAt;
    this.badges = badges;
  }
}

export { TargetProfileHistoryForAdmin };
