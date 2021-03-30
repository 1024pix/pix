class BadgeAcquisition {
  constructor({
    id,
    badge,
    userId,
    badgeId,
    campaignParticipationId,
  } = {}) {
    this.id = id;
    this.badge = badge;
    this.userId = userId;
    this.badgeId = badgeId;
    this.campaignParticipationId = campaignParticipationId;
  }
}

module.exports = BadgeAcquisition;
