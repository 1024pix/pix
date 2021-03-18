const Badge = require('./Badge.js');

class CampaignParticipationBadge extends Badge {

  constructor({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isAcquired,
    isCertifiable = false,
    badgeCriteria = [],
    badgePartnerCompetences = [],
    partnerCompetenceResults = [],
    targetProfileId,
  } = {}) {
    super({
      id,
      key,
      altMessage,
      imageUrl,
      message,
      title,
      isCertifiable,
      badgeCriteria,
      badgePartnerCompetences,
      targetProfileId,
    });
    this.partnerCompetenceResults = partnerCompetenceResults;
    this.isAcquired = isAcquired;
  }

  static buildFrom({ badge, partnerCompetenceResults, isAcquired }) {
    return new CampaignParticipationBadge({
      ...badge,
      partnerCompetenceResults,
      isAcquired,
    });
  }
}

module.exports = CampaignParticipationBadge;
