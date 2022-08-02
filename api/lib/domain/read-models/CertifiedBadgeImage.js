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
  constructor({ path, isTemporaryBadge, message = null, levelName }) {
    this.path = path;
    this.message = message;
    this.isTemporaryBadge = isTemporaryBadge;
    this.levelName = levelName;
  }

  static finalFromPath(path) {
    return new CertifiedBadgeImage({
      path,
      isTemporaryBadge: false,
    });
  }

  static fromPartnerKey(partnerKey, isTemporaryBadge, imageUrl) {
    const badgeKey = partnerKey;

    if (badgeKey === PIX_DROIT_MAITRE_CERTIF || badgeKey === PIX_DROIT_EXPERT_CERTIF) {
      return CertifiedBadgeImage.finalFromPath(imageUrl);
    }

    if (badgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE) {
      const levelName = 'Initié (entrée dans le métier)';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE) {
      const levelName = 'Initié (entrée dans le métier)';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(badgeKey)
    ) {
      const levelName = 'Confirmé';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (
      [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME].includes(badgeKey)
    ) {
      const levelName = 'Confirmé';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE) {
      const levelName = 'Avancé';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE) {
      const levelName = 'Avancé';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT) {
      const levelName = 'Expert';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }

    if (badgeKey === PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT) {
      const levelName = 'Expert';
      return new CertifiedBadgeImage({
        path: imageUrl,
        message: _getBadgeMessage(isTemporaryBadge, levelName),
        isTemporaryBadge,
        levelName,
      });
    }
  }
}

function _getBadgeMessage(isTemporaryBadge, levelName) {
  return isTemporaryBadge
    ? `Vous avez obtenu le niveau “${levelName}” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2`
    : `Vous avez obtenu la certification Pix+Edu niveau "${levelName}"`;
}

module.exports = CertifiedBadgeImage;
