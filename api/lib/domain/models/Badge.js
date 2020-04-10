class Badge {
  constructor({
    id,
    // attributes
    key,
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
    this.key = key;
    // includes
    this.badgePartnerCompetences = badgePartnerCompetences;
    // references
    this.targetProfileId = targetProfileId;
  }
}

Badge.keys = {
  PIX_EMPLOI_CLEA: 'PIX_EMPLOI_CLEA',
};

module.exports = Badge;
