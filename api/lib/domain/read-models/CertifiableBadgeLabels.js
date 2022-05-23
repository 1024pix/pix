const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
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
} = require('../models/Badge').keys;

const certifiableBadgeLabels = {
  [PIX_EMPLOI_CLEA_V1]: 'CléA Numérique',
  [PIX_EMPLOI_CLEA_V2]: 'CléA Numérique',
  [PIX_EMPLOI_CLEA_V3]: 'CléA Numérique',
  [PIX_DROIT_MAITRE_CERTIF]: 'Pix+ Droit Maître',
  [PIX_DROIT_EXPERT_CERTIF]: 'Pix+ Droit Expert',
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME]: 'Pix+ Édu 2nd degré Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME]: 'Pix+ Édu 2nd degré Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]: 'Pix+ Édu 2nd degré Avancé',
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]: 'Pix+ Édu 2nd degré Expert',
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE]: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
  [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME]: 'Pix+ Édu 1er degré Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME]: 'Pix+ Édu 1er degré Confirmé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE]: 'Pix+ Édu 1er degré Avancé',
  [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT]: 'Pix+ Édu 1er degré Expert',
};

class CertifiableBadgeLabels {
  static getLabelByBadgeKey(badgeKey) {
    return certifiableBadgeLabels[badgeKey];
  }

  static getCleaLabel() {
    return certifiableBadgeLabels[PIX_EMPLOI_CLEA_V1];
  }
}

CertifiableBadgeLabels.labels = certifiableBadgeLabels;

module.exports = CertifiableBadgeLabels;
