const {
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('./Badge').keys;

class PixEduBadgeAcquisitionOrderer {
  constructor({ badgesAcquisitions } = {}) {
    this.badgesAcquisitions = badgesAcquisitions;
  }

  getHighestBadge() {
    const expertFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT
    );
    const maitreFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE
    );
    const initieFormationContinueBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE
    );
    const initieFormationInitialeBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE
    );
    const entreeMetierFormationInitialeBadgeAcquisition = this.badgesAcquisitions.find(
      (badgesAcquisition) => badgesAcquisition.badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER
    );
    return (
      expertFormationContinueBadgeAcquisition ||
      maitreFormationContinueBadgeAcquisition ||
      initieFormationContinueBadgeAcquisition ||
      initieFormationInitialeBadgeAcquisition ||
      entreeMetierFormationInitialeBadgeAcquisition
    );
  }
}

module.exports = PixEduBadgeAcquisitionOrderer;
