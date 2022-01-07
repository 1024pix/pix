const {
  badgeKey: pixPlusDroitMaitreBadgeKey,
} = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const {
  badgeKey: pixPlusDroitExpertBadgeKey,
} = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../../domain/models/Badge').keys;

class CertifiedBadgeImage {
  constructor({ path, isTemporaryBadge, levelName }) {
    this.path = path;
    this.isTemporaryBadge = isTemporaryBadge;
    this.levelName = levelName;
  }

  static fromPartnerKey(partnerKey) {
    if (partnerKey === pixPlusDroitMaitreBadgeKey) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
        isTemporaryBadge: false,
      });
    }

    if (partnerKey === pixPlusDroitExpertBadgeKey) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
        isTemporaryBadge: false,
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-edu/autonome.svg',
        isTemporaryBadge: true,
        levelName: 'Autonome',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-edu/avance.svg',
        isTemporaryBadge: true,
        levelName: 'Avancé',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-edu/avance.svg',
        isTemporaryBadge: true,
        levelName: 'Avancé',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-edu/expert.svg',
        isTemporaryBadge: true,
        levelName: 'Expert',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-edu/formateur.svg',
        isTemporaryBadge: true,
        levelName: 'Formateur',
      });
    }
  }
}

module.exports = CertifiedBadgeImage;
