const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../domain/models/Badge').keys;

class CertifiedBadgeImage {
  constructor({ path, isTemporaryBadge, levelName }) {
    this.path = path;
    this.isTemporaryBadge = isTemporaryBadge;
    this.levelName = levelName;
  }

  static finalFromPath(path) {
    return new CertifiedBadgeImage({
      path,
      isTemporaryBadge: false,
    });
  }

  static fromPartnerKey(partnerKey, isTemporaryBadge) {
    const badgeKey = partnerKey;

    if (badgeKey === PIX_DROIT_MAITRE_CERTIF) {
      return CertifiedBadgeImage.finalFromPath('https://images.pix.fr/badges-certifies/pix-droit/maitre.svg');
    }

    if (badgeKey === PIX_DROIT_EXPERT_CERTIF) {
      return CertifiedBadgeImage.finalFromPath('https://images.pix.fr/badges-certifies/pix-droit/expert.svg');
    }

    if (badgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
        isTemporaryBadge,
        levelName: 'Initié (entrée dans le métier)',
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Autonome_PREMIER-DEGRE.svg',
        isTemporaryBadge,
        levelName: 'Initié (entrée dans le métier)',
      });
    }

    if (
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(badgeKey)
    ) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
        isTemporaryBadge,
        levelName: 'Confirmé',
      });
    }

    if (
      [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME].includes(badgeKey)
    ) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
        isTemporaryBadge,
        levelName: 'Confirmé',
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
        isTemporaryBadge,
        levelName: 'Avancé',
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-avance_PREMIER-DEGRE.svg',
        isTemporaryBadge,
        levelName: 'Avancé',
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert-certif.svg',
        isTemporaryBadge,
        levelName: 'Expert',
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT) {
      return new CertifiedBadgeImage({
        path: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Expert_PREMIER-DEGRE.svg',
        isTemporaryBadge,
        levelName: 'Expert',
      });
    }
  }
}

module.exports = CertifiedBadgeImage;
