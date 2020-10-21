class BadgeAcquisition {
  constructor({
    id,
    // attributes
    // includes
    badge,
    // references
    userId,
    badgeId,
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.badge = badge;
    // references
    this.userId = userId;
    this.badgeId = badgeId;
  }
}

module.exports = BadgeAcquisition;
