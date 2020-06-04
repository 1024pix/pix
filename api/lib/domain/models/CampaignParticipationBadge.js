const Badge = require('./Badge.js');

class CampaignParticipationBadge extends Badge {

  constructor({
    id,
    // attributes
    key,
    altMessage,
    imageUrl,
    message,
    isAcquired,
    // includes
    badgeCriteria = [],
    badgePartnerCompetences = [],
    partnerCompetenceResults = [],
    // references
    targetProfileId,
  } = {}) {
    super({
      id,
      key,
      altMessage,
      imageUrl,
      message,
      badgeCriteria,
      badgePartnerCompetences,
      targetProfileId
    });
    this.partnerCompetenceResults = partnerCompetenceResults;
    this.isAcquired = isAcquired;
  }

  static buildFrom({ badge, partnerCompetenceResults, isAcquired }) {
    return new CampaignParticipationBadge({
      ...badge,
      partnerCompetenceResults,
      isAcquired
    });
  }
}

module.exports = CampaignParticipationBadge;
