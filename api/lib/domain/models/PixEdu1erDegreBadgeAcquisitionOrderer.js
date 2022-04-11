const {
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('./Badge').keys;

class PixEdu1erDegreBadgeAcquisitionOrderer {
  constructor({ badgesAcquisitions } = {}) {
    this.badgesAcquisitions = badgesAcquisitions;
  }

  getHighestBadge() {
    const expertFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT
    );
    const avanceFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE
    );
    const confirmeFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME
    );
    const confirmeFormationInitialeBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME
    );
    const initieFormationInitialeBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE
    );
    return (
      expertFormationContinueBadgeAcquisition ||
      avanceFormationContinueBadgeAcquisition ||
      confirmeFormationContinueBadgeAcquisition ||
      confirmeFormationInitialeBadgeAcquisition ||
      initieFormationInitialeBadgeAcquisition ||
      null
    );
  }
}

module.exports = PixEdu1erDegreBadgeAcquisitionOrderer;
