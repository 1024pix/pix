const {
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('./Badge').keys;

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

  isPixEdu() {
    return [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ].includes(this.badgeKey);
  }
}

module.exports = BadgeAcquisition;
