const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
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

  isPixDroit() {
    return [PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF].includes(this.badgeKey);
  }

  isPixEdu() {
    return [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
    ].includes(this.badgeKey);
  }
}

module.exports = BadgeAcquisition;
