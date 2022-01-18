const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
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
    if (partnerKey === PIX_DROIT_MAITRE_CERTIF) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
        isTemporaryBadge: false,
      });
    }

    if (partnerKey === PIX_DROIT_EXPERT_CERTIF) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
        isTemporaryBadge: false,
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
        isTemporaryBadge: true,
        levelName: 'Initié (entrée dans le métier)',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
        isTemporaryBadge: true,
        levelName: 'Confirmé',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
        isTemporaryBadge: true,
        levelName: 'Confirmé',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
        isTemporaryBadge: true,
        levelName: 'Avancé',
      });
    }

    if (partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert-certif.svg',
        isTemporaryBadge: true,
        levelName: 'Expert',
      });
    }
  }
}

module.exports = CertifiedBadgeImage;
