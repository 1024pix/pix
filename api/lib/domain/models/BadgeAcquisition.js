class BadgeAcquisition {
  constructor({
    id,
    badge,
    userId,
    badgeId,
  } = {}) {
    this.id = id;
    this.badge = badge;
    this.userId = userId;
    this.badgeId = badgeId;
  }
}

module.exports = BadgeAcquisition;
