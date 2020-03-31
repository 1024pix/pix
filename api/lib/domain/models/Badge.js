class Badge {
  constructor({
    id,
    // attributes
    altMessage,
    imageUrl,
    message,
    // includes
    badgePartnerCompetences = [],
    // references
    targetProfileId,
  } = {}) {
    this.id = id;
    // attributes
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    // includes
    this.badgePartnerCompetences = badgePartnerCompetences;
    // references
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Badge;
