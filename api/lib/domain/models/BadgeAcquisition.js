class BadgeAcquisition {
  constructor({ id, badge, userId, badgeId, campaignParticipationId } = {}) {
    this.id = id;
    this.badge = badge;
    this.userId = userId;
    this.badgeId = badgeId;
    this.campaignParticipationId = campaignParticipationId;
  }

  get badgeKey() {
    return this.badge.key;
  }
}

export default BadgeAcquisition;
