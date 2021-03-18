class Badge {
  constructor({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isCertifiable,
    badgeCriteria = [],
    badgePartnerCompetences = [],
    targetProfileId,
  } = {}) {
    this.id = id;
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    this.title = title;
    this.key = key;
    this.isCertifiable = isCertifiable;
    this.badgeCriteria = badgeCriteria;
    this.badgePartnerCompetences = badgePartnerCompetences;
    this.targetProfileId = targetProfileId;
  }
}

Badge.keys = {
  PIX_EMPLOI_CLEA: 'PIX_EMPLOI_CLEA',
};

module.exports = Badge;
